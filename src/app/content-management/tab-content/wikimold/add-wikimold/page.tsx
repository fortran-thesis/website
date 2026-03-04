"use client";

import { useState, useEffect, useRef } from "react";
import ConfirmModal from "@/components/modals/confirmation_modal";
import Image from "next/image";
import BackButton from "@/components/buttons/back_button";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import dynamic from "next/dynamic";
import { apiMutate } from '@/lib/api';
import { mutate } from 'swr';

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface WikiMoldData {
  title: string;
  coverImage: string;
  content: string;
}

export default function AddWikiMold() {
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const initialData = useRef({ title: '', coverImage: '', content: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const userRole = "Mycologist";
  const fallbackImage = "/assets/wikimold-fallback.png";
  const [wikiMoldData, setWikiMoldData] = useState<WikiMoldData>({
    title: "",
    coverImage: "",
    content: "",
  });
  useEffect(() => {
    initialData.current = { ...wikiMoldData };
  }, []);

  useEffect(() => {
    const isChanged = wikiMoldData.title !== initialData.current.title || wikiMoldData.content !== initialData.current.content || wikiMoldData.coverImage !== initialData.current.coverImage;
    setInfoMessage(isChanged ? '' : 'You haven\'t made any changes yet.');
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [wikiMoldData]);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!coverImageFile) {
      setErrorMessage("Cover photo is required. Please select an image file.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const { getUserData } = await import("@/utils/auth");
    const user = getUserData();
    const author_id = user?.id || "";
    const title = wikiMoldData.title.trim();
    const body = wikiMoldData.content.trim();

    // Validation for required fields
    if (!title) {
      setErrorMessage("Title is required.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    if (!body) {
      setErrorMessage("Body is required.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    if (!author_id) {
      setErrorMessage("Author ID is required. Please log in again.");
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const details = {
        title,
        body,
        author_id,
        tags: [],
      };
      console.log("Submitting details:", details);
      formData.append("details", JSON.stringify(details));
      formData.append("cover_photo", coverImageFile);

      await apiMutate('/api/v1/moldipedia', {
        method: 'POST',
        formData,
      });

      // Revalidate SWR caches so moldipedia lists reflect the new article
      await mutate(
        (key: unknown) => typeof key === 'string' && (key.startsWith('/api/v1/moldipedia') || key.startsWith('$inf$/api/v1/moldipedia')),
        undefined,
        { revalidate: true },
      );

      setSuccessMessage("WikiMold article created successfully!");
      setWikiMoldData({ title: "", coverImage: "", content: "" });
      setCoverImagePreview("");
      setCoverImageFile(null);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error creating WikiMold:", error);
      const errorMsg = "Failed to create WikiMold article. " + (error instanceof Error ? error.message : "Please try again.");
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const isChanged = wikiMoldData.title !== initialData.current.title || wikiMoldData.content !== initialData.current.content || wikiMoldData.coverImage !== initialData.current.coverImage;
    if (isChanged) {
      setShowBackConfirm(true);
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
            style={{ width: '30%' }}
          />
        </div>
      )}

      <main className="relative flex flex-col xl:py-2 py-10 w-full">
        {infoMessage && (
          <div className="w-full max-w-2xl mx-auto mb-4 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg text-center font-semibold">
            {infoMessage}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            CONTENT MANAGEMENT
          </h1>
        </div>

        <div className="mt-8 mb-6">
          <BackButton onClick={handleBack} />
        </div>
      <ConfirmModal
        isOpen={showBackConfirm}
        title="Unsaved Changes"
        subtitle="You have unsaved changes. Are you sure you want to go back? Your changes will not be saved."
        confirmText="Go Back"
        cancelText="Stay"
        onCancel={() => setShowBackConfirm(false)}
        onConfirm={() => {
          setShowBackConfirm(false);
          window.history.back();
        }}
      />

        <form className="w-full" onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
                <ConfirmModal
                  isOpen={showConfirm}
                  title="Confirm Publish"
                  subtitle="Are you sure you want to publish this WikiMold article?"
                  confirmText="Publish"
                  cancelText="Cancel"
                  confirmDisabled={isSubmitting}
                  confirmLoadingText="Publishing..."
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={() => {
                    setShowConfirm(false);
                    handleSubmit();
                  }}
                />
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
          <div className="relative w-full mb-16 group">
            <div className="relative w-full h-[350px] rounded-[2.5rem] overflow-hidden bg-[var(--taupe)] shadow-2xl transition-all duration-700">
              <Image
                src={coverImagePreview || fallbackImage}
                alt="Cover"
                fill
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
              <label className="font-[family-name:var(--font-bricolage-grotesque)] absolute bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md text-[var(--moldify-black)] px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-white transition-all cursor-pointer shadow-2xl border border-white/20">
                <FontAwesomeIcon icon={faPen} />
                Add Cover Image
                <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="max-w-full mx-auto px-4">
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
                    ["bold", "italic", "underline", "link"],
                    [{ list: "ordered" }, { list: "bullet" }],
                  ],
                }}
                placeholder="Write your body here..."
              />
            </div>
          </div>

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