"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/buttons/back_button";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faArchive } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import { useMoldipediaArticle } from '@/hooks/swr';
import { apiMutate, ApiError } from '@/lib/api';
import { mutate } from 'swr';

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
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ViewWikiMoldContent />
    </Suspense>
  );
}

function ViewWikiMoldContent() {
  const searchParams = useSearchParams();
  const wikimoldId = searchParams.get("id") ?? '';
  const userRole = "Mycologist";
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const fallbackImage = "/assets/wikimold-fallback.png";

  const [wikiMoldInfo, setWikiMoldInfo] = useState<WikiMoldDetail>({
    id: "",
    title: "",
    coverImage: "",
    content: "",
    datePublished: new Date().toISOString().split("T")[0],
    tags: [],
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string>(fallbackImage);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const titleEditedRef = useRef(false);

  // SWR: fetch article
  const { data: articleRes, isLoading: loading } = useMoldipediaArticle(wikimoldId || undefined);

  // Sync SWR data into editable local state
  useEffect(() => {
    const data = articleRes?.data;
    if (!data) return;

    const mapped: WikiMoldDetail = {
      id: data.id ?? "",
      title: typeof data.title === "string" ? data.title : "Untitled Article",
      coverImage: typeof data.cover_photo === "string" ? data.cover_photo : "",
      content: typeof data.body === "string" ? data.body : "",
      datePublished: data.created_at ? (data.created_at as string).split("T")[0] : "",
      author: typeof data.author === "string" ? data.author : "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    };

    setWikiMoldInfo((prev) => ({
      ...mapped,
      title: titleEditedRef.current ? prev.title : mapped.title,
    }));

    if (!coverImageFile) {
      setCoverImagePreview(mapped.coverImage || fallbackImage);
    }
  }, [articleRes]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
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

    // Get real author_id from auth — same as AddWikiMold
    const { getUserData } = await import("@/utils/auth");
    const user = getUserData();
    const author_id = user?.id || "";

    if (!author_id) {
      alert("Author ID is required. Please log in again.");
      return;
    }

    setIsPublishing(true);

    try {
      const details = {
        title: wikiMoldInfo.title.trim(),
        body: wikiMoldInfo.content.trim(),
        author_id,
        tags: wikiMoldInfo.tags ?? [],
      };

      const formData = new FormData();
      formData.append("details", JSON.stringify(details));
      if (coverImageFile) {
        formData.append("cover_photo", coverImageFile);
      }

      await apiMutate(`/api/v1/moldipedia/${articleId}`, {
        method: 'PATCH',
        formData,
      });

      // Reset image state
      setCoverImageFile(null);
      titleEditedRef.current = false;

      // Revalidate SWR cache so the form shows fresh server data
      await Promise.all([
        mutate(`/api/v1/moldipedia/${articleId}`),
        // Revalidate list-level caches (include $inf$ prefix for useSWRInfinite keys)
        mutate(
          (key: unknown) => typeof key === 'string' && (key.startsWith('/api/v1/moldipedia') || key.startsWith('$inf$/api/v1/moldipedia')),
          undefined,
          { revalidate: true },
        ),
      ]);

      setSuccessMessage("WikiMold article updated successfully!");
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Please try again.');
      setErrorMessage(`Failed to update article. ${message}`);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  /** Handles archiving a moldipedia article */
  const handleArchive = async () => {
    const articleId = wikiMoldInfo.id || wikimoldId;
    if (!articleId) {
      setErrorMessage("Cannot archive: article ID is missing.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setIsArchiving(true);

    try {
      await apiMutate(`/api/v1/moldipedia/${articleId}/archive`, {
        method: 'PATCH',
        body: {},
      });

      setIsArchiveModalOpen(false);

      // Revalidate SWR cache to refresh UI with fresh data
      await Promise.all([
        mutate(`/api/v1/moldipedia/${articleId}`),
        // Revalidate list-level caches (include $inf$ prefix for useSWRInfinite keys)
        mutate(
          (key: unknown) => typeof key === 'string' && (key.startsWith('/api/v1/moldipedia') || key.startsWith('$inf$/api/v1/moldipedia')),
          undefined,
          { revalidate: true },
        ),
      ]);

      setSuccessMessage("WikiMold article archived successfully!");
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Please try again.');
      setErrorMessage(`Failed to archive article. ${message}`);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsArchiving(false);
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
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="w-full mb-4 px-4 py-3 bg-green-100 text-green-800 rounded-lg text-left font-semibold">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="w-full mb-4 px-4 py-3 bg-red-100 text-red-800 rounded-lg text-left font-semibold">
            {errorMessage}
          </div>
        )}
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
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
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

          {/* Content Editor */}
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsArchiveModalOpen(true);
            }}
            disabled={isArchiving || loading}
            className="flex items-center gap-2 bg-[var(--moldify-red)] text-white font-black uppercase tracking-[0.2em] px-6 py-5 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed border-2 border-white/20 backdrop-blur-md"
          >
            <FontAwesomeIcon icon={faArchive} />
            Archive
          </button>
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

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={isArchiveModalOpen}
        title="Archive WikiMold Article?"
        subtitle="Are you sure you want to archive this article? It will no longer be visible in the public moldipedia, but can be restored later."
        cancelText="Cancel"
        confirmText={isArchiving ? "Archiving..." : "Archive"}
        confirmDisabled={isArchiving}
        onCancel={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchive}
      />
    </main>
  );
}