"use client";

import { useState } from "react";
import Image from "next/image";
import BackButton from "@/components/buttons/back_button";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with no SSR to avoid hydration issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface WikiMoldData {
  title: string;
  coverImage: string;
  content: string;
}

export default function AddWikiMold() {
  const userRole = "Mycologist";

  const [wikiMoldData, setWikiMoldData] = useState<WikiMoldData>({
    title: "",
    coverImage: "",
    content: "",
  });

  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        setWikiMoldData({ ...wikiMoldData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImageFile) {
      alert('Please upload a cover photo.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('details', JSON.stringify({ title: wikiMoldData.title, body: wikiMoldData.content }));
      formData.append('cover_photo', coverImageFile);

      const res = await fetch('/api/v1/moldipedia', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.message || `Failed to create article (${res.status})`);
      }
      alert('WikiMold article created successfully!');
      setWikiMoldData({ title: '', coverImage: '', content: '' });
      setCoverImagePreview('');
      setCoverImageFile(null);
    } catch (error) {
      console.error('Error creating WikiMold:', error);
      alert(error instanceof Error ? error.message : 'Failed to create WikiMold article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Top Loading Bar */}
      {isSubmitting && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

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

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="w-full">
        {/* Cover Image Section */}
        <div className="mb-8">
          <label className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-sm mb-3">
            Cover Photo
          </label>
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[var(--moldify-softGrey)] group">
            {coverImagePreview ? (
              <Image
                src={coverImagePreview}
                alt="Cover"
                fill
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-sm">
                  No cover photo uploaded
                </p>
              </div>
            )}

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
            value={wikiMoldData.title}
            onChange={(e) => setWikiMoldData({ ...wikiMoldData, title: e.target.value })}
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
              value={wikiMoldData.content}
              onChange={(content) => setWikiMoldData({ ...wikiMoldData, content })}
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
            disabled={isSubmitting || !wikiMoldData.title.trim() || !coverImageFile || !wikiMoldData.content.trim()}
            className={`flex items-center justify-center gap-2 font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-8 py-3 rounded-lg hover:bg-[var(--hover-primary)] transition-colors text-sm disabled:opacity-50 ${
              isSubmitting ? 'cursor-wait' : 'cursor-pointer'
            }`}
          >
            Create Article
          </button>
        </div>
      </form>
    </main>
    </>
  );
}
     