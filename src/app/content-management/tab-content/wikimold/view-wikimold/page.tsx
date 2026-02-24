"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/buttons/back_button";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCloudArrowUp, faPen } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

type WikiMoldDetail = {
  id: string;
  title: string;
  coverImage: string;
  content: string;
  datePublished: string;
  author?: string;
  tags?: string[];
};

export default function ViewWikiMold() {
    // Import getAuthToken utility
    // (If not already imported at the top, add: import { getAuthToken } from "@/utils/auth";)
  const searchParams = useSearchParams();
  const wikimoldId = searchParams.get("id") ?? '';
  const userRole = "Mycologist";

  const fallbackImage = "/assets/wikimold-fallback.png";

  const [wikiMoldInfo, setWikiMoldInfo] = useState<WikiMoldDetail>({
    id: "",
    title: "",
    coverImage: "",
    content: "",
    datePublished: new Date().toISOString().split("T")[0],
    tags: [],
  });

  // Separate cover image preview state
  const [coverImagePreview, setCoverImagePreview] = useState<string>(fallbackImage);
  // Track if a new cover image file was selected (base64)
  const [newCoverImageBase64, setNewCoverImageBase64] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use a ref to track whether the user has edited the title
  // so that async fetch responses never clobber user input
  const titleEditedRef = useRef(false);

  // Fetch article from API
  useEffect(() => {
    // Reset edit guards when the article ID changes
    titleEditedRef.current = false;

    async function fetchWikiMold() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/moldipedia/${wikimoldId}`);
        if (!res.ok) throw new Error("Failed to fetch article");
        const json = await res.json();
        const data = json.data;

        const mapped: WikiMoldDetail = {
          id: data.id ?? "",
          title: typeof data.title === "string" ? data.title : "Untitled Article",
          coverImage: typeof data.cover_photo === "string" ? data.cover_photo : "",
          content: typeof data.body === "string" ? data.body : "",
          datePublished: data.created_at ? data.created_at.split("T")[0] : "",
          author: typeof data.author === "string" ? data.author : "",
          tags: Array.isArray(data.tags) ? data.tags : [],
        };

        // Only set fields the user hasn't touched yet
        setWikiMoldInfo((prev) => ({
          ...mapped,
          title: titleEditedRef.current ? prev.title : mapped.title,
        }));

        // Only reset the preview if user hasn't picked a new image
        if (!newCoverImageBase64) {
          setCoverImagePreview(mapped.coverImage || fallbackImage);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // Leave existing state intact on error; just stop loading
      } finally {
        setLoading(false);
      }
    }

    fetchWikiMold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wikimoldId]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCoverImagePreview(base64);
      setNewCoverImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!wikiMoldInfo.title.trim()) return;

    const articleId = wikiMoldInfo.id || wikimoldId;
    if (!articleId) {
      alert("Cannot save: article ID is missing.");
      return;
    }

    setIsPublishing(true);
    try {
      const payload: Record<string, unknown> = {
        id: articleId,
        title: wikiMoldInfo.title,
        body: wikiMoldInfo.content,
        author_id: wikiMoldInfo.author ?? "",
        tags: wikiMoldInfo.tags ?? [],
      };

      // Only send cover_photo if the user actually picked a new one
      if (newCoverImageBase64) {
        payload.cover_photo = newCoverImageBase64;
      }

      const patchUrl = `/api/v1/moldipedia/${articleId}`;
      console.log("PATCH URL:", patchUrl);
      console.log("Payload:", JSON.stringify({ details: payload }));

      // Add Authorization header
      const token = typeof window !== "undefined" ? (await import("@/utils/auth")).getAuthToken() : null;
      const res = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ details: payload }),
        credentials: "include",
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to update article: ${res.status} ${errText}`);
      }

      // Don't overwrite local state from the response — just confirm success
      // Reset the "new image" flag since it's now saved
      setNewCoverImageBase64(null);
      titleEditedRef.current = false;

      alert("WikiMold article updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert(`Failed to update article. ${err instanceof Error ? err.message : "Please try again."}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
          CONTENT MANAGEMENT
        </h1>
      </div>

      <div className="mt-8 mb-6">
        <BackButton />
      </div>

      <form className="w-full">
        {/* Cover Image */}
        <div className="relative w-full mb-16 group">
          <div className="relative w-full h-[350px] rounded-[2.5rem] overflow-hidden bg-[var(--taupe)] shadow-2xl transition-all duration-700">
            <Image
              src={coverImagePreview}
              alt="Cover"
              fill
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
            <label className="absolute bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md text-[var(--moldify-black)] px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-white transition-all cursor-pointer shadow-2xl border border-white/20">
              <FontAwesomeIcon icon={faPen} />
              Add Cover Image
              <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4">
          {/* Title */}
          <div className="mb-12">
            {loading ? (
              <div className="animate-pulse h-12 w-full bg-gray-200 rounded" />
            ) : (
              <input
                id="title"
                type="text"
                value={wikiMoldInfo.title}
                onChange={(e) => {
                  titleEditedRef.current = true;
                  setWikiMoldInfo((prev) => ({ ...prev, title: e.target.value }));
                }}
                placeholder="Enter Title..."
                className="w-full font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] text-4xl font-black bg-transparent border-none placeholder:opacity-20 focus:outline-none transition-all"
              />
            )}
          </div>

          {/* Content */}
          <div className="relative">
            <style>{`
              .ql-toolbar.ql-snow {
                border: none !important;
                background: transparent !important;
                padding: 0 0 1.5rem 0 !important;
                margin-bottom: 2rem !important;
                border-bottom: 1px solid rgba(0,0,0,0.05) !important;
              }
              .ql-container.ql-snow {
                border: none !important;
              }
              .ql-editor {
                font-size: 1.25rem !important;
                line-height: 1.9 !important;
                color: var(--moldify-black) !important;
                padding: 0 !important;
                min-height: 600px !important;
              }
              .ql-editor.ql-blank::before {
                left: 0 !important;
                font-style: normal !important;
                opacity: 0.3 !important;
                color: var(--moldify-grey) !important;
              }
              .ql-stroke { stroke: var(--moldify-grey) !important; }
              .ql-fill { fill: var(--moldify-grey) !important; }
              .ql-active .ql-stroke { stroke: var(--primary-color) !important; }
            `}</style>
            <ReactQuill
              value={wikiMoldInfo.content}
              onChange={(content) => {
                setWikiMoldInfo((prev) => ({ ...prev, content }));
              }}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [2, 3, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                ],
              }}
              placeholder="Write your body here..."
            />
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handlePublish();
            }}
            disabled={isPublishing || !wikiMoldInfo.title.trim()}
            className="flex items-center gap-4 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed border-2 border-white/20 backdrop-blur-md"
          >
            {isPublishing ? "Syncing to Database..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}