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
import { StickyDossierNav } from "@/components/dossier_nav";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface WikiMoldData {
  // Frontend form model that maps to the payload sent to POST /api/v1/moldipedia.
  title: string;
  coverImage: string;
  content: string;
  mold_type: string;
  treatments: {
    mechanical: string;
    cultural: string;
    biological: string;
    physical: string;
    chemical: string;
  };
  findings: Array<{
    title: string;
    content: string;
  }>;
}

const EMPTY_WIKIMOLD_DATA: WikiMoldData = {
  // Stable defaults keep all inputs controlled from first render.
  title: "",
  coverImage: "",
  content: "",
  mold_type: "",
  treatments: {
    mechanical: "",
    cultural: "",
    biological: "",
    physical: "",
    chemical: "",
  },
  findings: [
    { title: "", content: "" },
    { title: "", content: "" },
    { title: "", content: "" },
    { title: "", content: "" },
    { title: "", content: "" },
  ],
};

export default function AddWikiMold() {
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const initialData = useRef<WikiMoldData>(EMPTY_WIKIMOLD_DATA);
  const [showConfirm, setShowConfirm] = useState(false);
  const userRole = "Mycologist";
  const fallbackImage = "/assets/wikimold-fallback.png";
  const [wikiMoldData, setWikiMoldData] = useState<WikiMoldData>(EMPTY_WIKIMOLD_DATA);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { id: 'description', label: '01. Description' },
    { id: 'treatments', label: '02. Treatment Control' },
    { id: 'findings', label: '03. Findings' },
  ];

  useEffect(() => {
    // Snapshot baseline form data for unsaved-changes detection.
    initialData.current = { ...wikiMoldData };
  }, []);

  useEffect(() => {
    // TODO: JSON.stringify diffing is simple but can get expensive as editor content grows.
    // Consider dirty flags per section (or a deep-equal helper with memoization) for better scalability.
    const isChanged = JSON.stringify(wikiMoldData) !== JSON.stringify(initialData.current) || !!coverImageFile;
    setInfoMessage(isChanged ? '' : 'You haven\'t made any changes yet.');
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [wikiMoldData, coverImageFile]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Preview image locally; actual file is still uploaded via FormData.
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

    // Lazy-load auth helper to avoid loading auth logic until submit time.
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
      // API payload contract: details JSON + cover_photo multipart file.
      const details = {
        title,
        body,
        author_id,
        tags: [],
        // TODO: This nested shape is cleaner for frontend, but verify backend contract accepts this structure.
        // If backend expects flat keys (e.g., treatment_mechanical), add a mapper before submit.
        mold_type: wikiMoldData.mold_type.trim(),
        treatments: {
          mechanical: wikiMoldData.treatments.mechanical.trim(),
          cultural: wikiMoldData.treatments.cultural.trim(),
          biological: wikiMoldData.treatments.biological.trim(),
          physical: wikiMoldData.treatments.physical.trim(),
          chemical: wikiMoldData.treatments.chemical.trim(),
        },
        findings: wikiMoldData.findings.map(f => ({
          title: f.title.trim(),
          content: f.content.trim(),
        })),
      };
      // TODO: Remove verbose payload logs in production to avoid leaking content in browser consoles.
      console.log("Submitting details:", details);
      formData.append("details", JSON.stringify(details));
      formData.append("cover_photo", coverImageFile);

      await apiMutate('/api/v1/moldipedia', {
        method: 'POST',
        formData,
      });

      // Revalidate list caches so newly created article appears immediately.
      await mutate(
        (key: unknown) => typeof key === 'string' && (key.startsWith('/api/v1/moldipedia') || key.startsWith('$inf$/api/v1/moldipedia')),
        undefined,
        { revalidate: true },
      );

      setSuccessMessage("WikiMold article created successfully!");
        // Reset form and local image state after successful create.
        setWikiMoldData(EMPTY_WIKIMOLD_DATA);
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
    const isChanged = JSON.stringify(wikiMoldData) !== JSON.stringify(initialData.current) || !!coverImageFile;
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

      {/* Main editor shell: header, cover hero, sticky nav, and sectioned content form. */}
      <main className="relative flex flex-col xl:py-2 py-10 w-full font-[family-name:var(--font-bricolage-grotesque)]">
        {infoMessage && (
          <div className="w-full max-w-2xl mx-auto mb-4 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg text-center font-semibold">
            {infoMessage}
          </div>
        )}
        <div className="flex flex-col gap-2 mb-8">
          <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl uppercase tracking-tighter">
            Content Management
          </h1>
        </div>

        <div className="mb-8">
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
          {/* Cover hero with inline image picker; preview updates before submit. */}
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

          {/* Sticky in-page navigation for quick jumps between major form sections. */}
          <StickyDossierNav items={navItems} />

          {/* Article Meta Section */}
          <div className="max-w-full mx-auto px-4 mb-24 mt-10">
            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24 relative">
              {/* Column 1: Article Title */}
              <div className="flex-1 w-full group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">01. Project Title</span>
                </div>

                <div className="relative">
                  <input
                    id="title"
                    type="text"
                    value={wikiMoldData.title}
                    onChange={(e) => setWikiMoldData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter Title..."
                    className="w-full py-4 bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-5xl font-black placeholder:opacity-10 focus:outline-none transition-all uppercase tracking-tighter"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary-color)]/10 group-focus-within:bg-[var(--accent-color)] transition-colors duration-300" />
                </div>

                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary-color)]/30 mt-4 italic">
                  Public Facing Database Heading
                </p>
              </div>

              {/* Column 2: Mold Genus */}
              <div className="flex-1 w-full group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">02. Genus Name</span>
                </div>

                <div className="relative">
                  <input
                    id="mold_type"
                    type="text"
                    value={wikiMoldData.mold_type}
                    onChange={(e) => setWikiMoldData((prev) => ({ ...prev, mold_type: e.target.value }))}
                    placeholder="Genus Species..."
                    className="w-full py-4 bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-5xl font-black italic placeholder:opacity-10 focus:outline-none transition-all tracking-tight"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary-color)]/10 group-focus-within:bg-[var(--accent-color)] transition-colors duration-300" />
                </div>

                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary-color)]/30 mt-4 italic">
                  Scientific Pathogen Identification
                </p>
              </div>
            </div>
          </div>

          {/* Sectioned editor body for description, treatments, and findings content blocks. */}
          <div className="max-w-full mx-auto px-4 space-y-20">
            {/* Section 1: core biological description (main article body). */}
            <section id="description" className="scroll-mt-32 mt-22">
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 01</label>
                <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Mold Description</h2>
              </div>

              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 01</label>
                  <h2 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tighter">Biological Description</h2>
                </div>
                <div className="space-y-4">
                  <ReactQuill
                    value={wikiMoldData.content}
                    onChange={(content) => setWikiMoldData((prev) => ({ ...prev, content }))}
                    theme="snow"
                    placeholder="Describe the pathogen characteristics..."
                  />
                </div>
              </div>
            </section>

            {/* Section 2: treatment protocol variants grouped by control type. */}
            <section id="treatments" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 02</label>
                <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Remediation Protocols</h2>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {Object.entries({
                  mechanical: 'Mechanical',
                  cultural: 'Cultural',
                  biological: 'Biological',
                  physical: 'Physical',
                  chemical: 'Chemical',
                }).map(([key, label], index) => (
                  <div key={key} className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Protocol 0{index + 1}</label>
                      <h3 className="font-black text-2xl text-[var(--primary-color)]">{label} Control</h3>
                    </div>
                    <ReactQuill
                      value={wikiMoldData.treatments[key as keyof typeof wikiMoldData.treatments] || ""}
                      onChange={(val) => setWikiMoldData((prev) => ({
                        ...prev,
                        treatments: {
                          ...prev.treatments,
                          [key]: val,
                        },
                      }))}
                      theme="snow"
                      placeholder={`Detail the ${label.toLowerCase()} steps...`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: staged findings entries for investigative progression. */}
            <section id="findings" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 03</label>
                <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Discovery Findings</h2>
              </div>

              <div className="space-y-12">
                {wikiMoldData.findings.map((finding, index) => (
                  <div key={index} className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent transition-all hover:border-[var(--primary-color)]/10">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40 font-[family-name:var(--font-bricolage-grotesque)]">Discovery Stage 0{index + 1}</label>
                      <h3 className="font-black text-2xl text-[var(--primary-color)]">Stage {index + 1}</h3>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Detailed Analysis</label>
                      <ReactQuill
                        value={finding.content}
                        onChange={(val) => setWikiMoldData((prev) => {
                          const newFindings = [...prev.findings];
                          newFindings[index] = { ...newFindings[index], content: val };
                          return { ...prev, findings: newFindings };
                        })}
                        theme="snow"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shared rich-text editor skin to keep all Quill instances visually consistent. */}
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
          </div>

          {/* Floating primary action keeps publish CTA visible while scrolling long forms. */}
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