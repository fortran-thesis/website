"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import BackButton from "@/components/buttons/back_button";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with no SSR to avoid hydration issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface WikiMoldDetail {
  id: string;
  title: string;
  coverImage: string;
  content: string;
  datePublished: string;
}

export default function ViewWikiMold() {
  const searchParams = useSearchParams();
  const wikimoldId = searchParams.get("id") ?? '';
  const userRole = "Mycologist";

  const [wikiMoldInfo, setWikiMoldInfo] = useState<WikiMoldDetail>({
    id: '',
    title: '',
    coverImage: '',
    content: '',
    datePublished: new Date().toISOString().split('T')[0],
  });

  const fallbackImage = "/assets/wikimold-fallback.png";
  const [coverImagePreview, setCoverImagePreview] = useState(fallbackImage);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch article from API
  useEffect(() => {
    if (!wikimoldId) return;
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/moldipedia/${wikimoldId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch article (${res.status})`);
        const body = await res.json();
        const data = body.data;
        if (data) {
          setWikiMoldInfo({
            id: data.id || wikimoldId,
            title: data.title || '',
            coverImage: data.cover_photo || '',
            content: data.body || '',
            datePublished: data.metadata?.created_at?._seconds
              ? new Date(data.metadata.created_at._seconds * 1000).toISOString().split('T')[0]
              : '',
          });
          setCoverImagePreview(data.cover_photo || fallbackImage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [wikimoldId]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        setWikiMoldInfo({ ...wikiMoldInfo, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/moldipedia/${wikimoldId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: wikiMoldInfo.title, body: wikiMoldInfo.content }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.message || `Failed to update (${res.status})`);
      }
      alert('WikiMold article updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
          CONTENT MANAGEMENT
        </h1>
      </div>

      {/* Back Button */}
      <div className="mt-6 mb-8">
        <BackButton />
      </div>

      {isLoading && <p className="text-[var(--moldify-grey)] text-sm">Loading article...</p>}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Main Content */}
      <form className="w-full">
        {/* Cover Image Section */}
        <div className="mb-8">
          <label className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-sm mb-3">
            Cover Photo
          </label>
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[var(--taupe)]/20 group">
            <Image
              src={coverImagePreview || fallbackImage}
              alt="Cover"
              fill
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />

            {/* Pencil Icon Overlay */}
            <label className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--hover-primary)] transition cursor-pointer shadow-lg hover:scale-110">
              <FontAwesomeIcon icon={faPen} className="text-[var(--background-color)]" style={{ width: "16px", height: "16px" }} />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <label htmlFor="title" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-sm mb-3">
            Article Title
          </label>
          <input
            id="title"
            type="text"
            value={wikiMoldInfo.title}
            onChange={(e) => setWikiMoldInfo({ ...wikiMoldInfo, title: e.target.value })}
            placeholder="Enter article title"
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
          />
        </div>

        {/* Content Section with Rich Text Editor */}
        <div className="mb-8">
          <label className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-sm mb-3">
            Article Content
          </label>
          <style>{`
            .ql-container { 
              background-color: var(--taupe); 
              font-size: 16px; 
              min-height: 350px;
            }
            .ql-editor {
              min-height: 250px;
              padding: 12px;
              font-family: var(--font-bricolage-grotesque);
            }
            .ql-toolbar { 
              background-color: var(--taupe);
              border: none;
            }
          `}</style>
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "var(--taupe)" }}>
            <ReactQuill
              value={wikiMoldInfo.content}
              onChange={(content) => setWikiMoldInfo({ ...wikiMoldInfo, content })}
              theme="snow"
              modules={{
                toolbar: [
                  ["bold", "italic", "underline", "strike"],
                  ["blockquote", "code-block"],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              placeholder="Write your article content here..."
              className="text-[var(--moldify-black)]"
            />
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex gap-4 justify-end">
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handlePublish();
            }}
            disabled={isPublishing || !wikiMoldInfo.title.trim()}
          >
            {isPublishing ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </main>
  );
}
