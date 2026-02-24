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
    const fallbackImage = "/assets/wikimold-fallback.png";
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

        {/* Navigation - Back Button above the image */}
        <div className="mt-8 mb-6">
          <BackButton />
        </div>

        <form className="w-full" onSubmit={handleSubmit}>
          {/* Full Width Cover Image Section */}
          <div className="relative w-full mb-16 group">
            <div className="relative w-full h-[350px] rounded-[2.5rem] overflow-hidden bg-[var(--taupe)] shadow-2xl transition-all duration-700">
              <Image
                src={coverImagePreview || fallbackImage}
                alt="Cover"
                fill
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              {/* Gradient Overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
              <label className="font-[family-name:var(--font-bricolage-grotesque)] absolute bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md text-[var(--moldify-black)] px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-white transition-all cursor-pointer shadow-2xl border border-white/20">
                <FontAwesomeIcon icon={faPen} />
                Add Cover Image
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Writer Layout Container */}
          <div className="max-w-full mx-auto px-4">
            {/* Title Section */}
            <div className="mb-12">
              <input
                id="title"
                type="text"
                value={wikiMoldData.title}
                onChange={(e) => setWikiMoldData({ ...wikiMoldData, title: e.target.value })}
                placeholder="Enter Title..."
                className="w-full font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] text-4xl font-black bg-transparent border-none placeholder:opacity-20 focus:outline-none transition-all"
              />
            </div>

            {/* Manuscript Content */}
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
                  font-[family-name:var(--font-bricolage-grotesque)] !important;
                }
                .ql-editor {
                  font-size: 1.25rem !important;
                  line-height: 1.9 !important;
                  color: var(--moldify-black) !important;
                  padding: 0 !important;
                  min-height: 600px !important;
                  font-family: var(--font-bricolage-grotesque);
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
                value={wikiMoldData.content}
                onChange={(content) => setWikiMoldData({ ...wikiMoldData, content })}
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

          {/* Floating Action Bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
            <button
              type="submit"
              disabled={isSubmitting || !wikiMoldData.title.trim()}
              className="font-[family-name:var(--font-montserrat)] flex items-center gap-4 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed border-2 border-white/20 backdrop-blur-md"
            >
              {isSubmitting ? "Syncing to Database..." : "Publish Article"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}