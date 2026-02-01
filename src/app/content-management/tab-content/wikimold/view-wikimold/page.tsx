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

// Dummy data for prefilling
const DUMMY_WIKIMOLD_DETAILS: Record<string, WikiMoldDetail> = {
  "WM-001": {
    id: "WM-001",
    title: "Aspergillus: A Comprehensive Guide to Fungal Identification",
    coverImage: "/assets/mold1.jpg",
    content: "<h2>Introduction to Aspergillus</h2><p>Aspergillus is one of the most important genera of fungi, known for its widespread occurrence in nature and significant impact on human health and industry.</p>",
    datePublished: "2024-01-15",
  },
  "WM-002": {
    id: "WM-002",
    title: "Penicillium Species and Their Agricultural Impact",
    coverImage: "",
    content: "<h2>Penicillium in Agriculture</h2><p>Penicillium species play a crucial role in agricultural contexts, both beneficial and detrimental.</p>",
    datePublished: "2024-01-10",
  },
};

export default function ViewWikiMold() {
  const searchParams = useSearchParams();
  const wikimoldId = searchParams.get("id") || "WM-001";
  const userRole = "Mycologist";

  const [wikiMoldInfo, setWikiMoldInfo] = useState<WikiMoldDetail>(
    DUMMY_WIKIMOLD_DETAILS[wikimoldId] || {
      id: "",
      title: "",
      coverImage: "",
      content: "",
      datePublished: new Date().toISOString().split("T")[0],
    }
  );

  const fallbackImage = "/assets/wikimold-fallback.png";
  const [coverImagePreview, setCoverImagePreview] = useState(wikiMoldInfo.coverImage || fallbackImage);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (DUMMY_WIKIMOLD_DETAILS[wikimoldId]) {
      setWikiMoldInfo(DUMMY_WIKIMOLD_DETAILS[wikimoldId]);
      setCoverImagePreview(DUMMY_WIKIMOLD_DETAILS[wikimoldId].coverImage);
    }
  }, [wikimoldId]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    // Simulate publishing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsPublishing(false);
    alert("WikiMold article published successfully!");
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
            className="flex items-center justify-center gap-2 font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-8 py-3 rounded-lg hover:bg-[var(--hover-primary)] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </main>
  );
}
