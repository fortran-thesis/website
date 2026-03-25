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
import { invalidateMoldipedia } from '@/utils/cache-invalidation';

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import { StickyDossierNav } from "@/components/dossier_nav";

type WikiMoldDetail = {
  // Editable article model used by the form and PATCH payload construction.
  id: string;
  title: string;
  coverImage: string;
  content: string;
  datePublished: string;
  author?: string;
  tags?: string[];
  mold_type: string;
  // Host & Pathogen Impact fields
  affected_hosts?: string; // List of affected crops/hosts (HTML from editor)
  symptoms?: string; // Visual symptoms and signs of infection (HTML from editor)
  disease_cycle?: string; // How disease spreads and lifecycle info (HTML from editor)
  impact?: string; // Economic/health impact analysis (HTML from editor)
  prevention?: string; // Prevention strategies (HTML from editor)
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
};

export default function ViewWikiMold() {
  return (
    <Suspense fallback={
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
        <div
          className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
          style={{ width: '30%' }}
        />
      </div>
    }>
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
    // Controlled input defaults prevent undefined -> string transitions.
    id: "",
    title: "",
    coverImage: "",
    content: "",
    datePublished: new Date().toISOString().split("T")[0],
    tags: [],
    mold_type: "",
    // Host & Pathogen Impact fields initialization
    affected_hosts: "",
    symptoms: "",
    disease_cycle: "",
    impact: "",
    prevention: "",
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
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string>(fallbackImage);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const titleEditedRef = useRef(false);

  // SWR fetches article by query-param id and keeps local cache synchronized.
  const { data: articleRes, isLoading: loading } = useMoldipediaArticle(wikimoldId || undefined);

  // Map API response into a fully-populated local form model.
  useEffect(() => {
    const data = articleRes?.data;
    if (!data) return;
    // TODO: Temporary compatibility bridge. This double-cast + string-key access is less type-safe.
    // Replace with a fully typed API model (or typed mapper utility) once MoldipediaArticle includes these fields.
    const source = data as unknown as Record<string, unknown>;

    const mapped: WikiMoldDetail = {
      // Normalize API fields to stable strings used by form controls.
      id: data.id ?? "",
      title: typeof data.title === "string" ? data.title : "Untitled Article",
      coverImage: typeof data.cover_photo === "string" ? data.cover_photo : "",
      content: typeof data.body === "string" ? data.body : "",
      datePublished: data.created_at ? (data.created_at as string).split("T")[0] : "",
      author: typeof data.author === "string" ? data.author : "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      mold_type: typeof source["mold_type"] === "string" ? (source["mold_type"] as string) : "",
      // Host & Pathogen Impact field mappings
      affected_hosts: typeof source["affected_hosts"] === "string" ? (source["affected_hosts"] as string) : "",
      symptoms: typeof source["symptoms"] === "string" ? (source["symptoms"] as string) : "",
      disease_cycle: typeof source["disease_cycle"] === "string" ? (source["disease_cycle"] as string) : "",
      impact: typeof source["impact"] === "string" ? (source["impact"] as string) : "",
      prevention: typeof source["prevention"] === "string" ? (source["prevention"] as string) : "",
      treatments: {
        mechanical: typeof source["treatment_mechanical"] === "string" ? (source["treatment_mechanical"] as string) : "",
        cultural: typeof source["treatment_cultural"] === "string" ? (source["treatment_cultural"] as string) : "",
        biological: typeof source["treatment_biological"] === "string" ? (source["treatment_biological"] as string) : "",
        physical: typeof source["treatment_physical"] === "string" ? (source["treatment_physical"] as string) : "",
        chemical: typeof source["treatment_chemical"] === "string" ? (source["treatment_chemical"] as string) : "",
      },
      findings: [1, 2, 3, 4, 5].map((num) => ({
        title: typeof source[`finding_title_${num}`] === "string" ? (source[`finding_title_${num}`] as string) : "",
        content: typeof source[`finding_content_${num}`] === "string" ? (source[`finding_content_${num}`] as string) : "",
      })),
    };

    setWikiMoldInfo((prev) => ({
      ...mapped,
      // Preserve in-progress title edits while background revalidation happens.
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

    // Resolve author identity from client auth for audit fields in backend.
    const { getUserData } = await import("@/utils/auth");
    const user = getUserData();
    const author_id = user?.id || "";

    if (!author_id) {
      alert("Author ID is required. Please log in again.");
      return;
    }

    setIsPublishing(true);

    try {
      // PATCH payload mirrors add-wikimold structure for consistency.
      const details = {
        title: wikiMoldInfo.title.trim(),
        body: wikiMoldInfo.content.trim(),
        author_id,
        tags: wikiMoldInfo.tags ?? [],
        mold_type: wikiMoldInfo.mold_type.trim(),
        // Host & Pathogen Impact fields
        affected_hosts: wikiMoldInfo.affected_hosts?.trim() ?? "",
        symptoms: wikiMoldInfo.symptoms?.trim() ?? "",
        disease_cycle: wikiMoldInfo.disease_cycle?.trim() ?? "",
        impact: wikiMoldInfo.impact?.trim() ?? "",
        prevention: wikiMoldInfo.prevention?.trim() ?? "",
        treatments: {
          mechanical: wikiMoldInfo.treatments.mechanical.trim(),
          cultural: wikiMoldInfo.treatments.cultural.trim(),
          biological: wikiMoldInfo.treatments.biological.trim(),
          physical: wikiMoldInfo.treatments.physical.trim(),
          chemical: wikiMoldInfo.treatments.chemical.trim(),
        },
        findings: wikiMoldInfo.findings.map((f) => ({
          title: f.title.trim(),
          content: f.content.trim(),
        })),
      };

      const formData = new FormData();
      // Update endpoint accepts multipart data to support optional cover image replacement.
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

      await invalidateMoldipedia();

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

  /** Archive article via backend and revalidate caches for immediate UI consistency. */
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

      await invalidateMoldipedia();

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


  const navItems = [
    { id: 'description', label: 'Description' },
    { id: 'analysis', label: 'Fungal Analysis' },
    { id: 'prevention', label: 'Prevention' },
    { id: 'treatments', label: 'Treatments' },
  ];

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full font-[family-name:var(--font-bricolage-grotesque)]">
      
      {/* Loading Bar */}
      {isPublishing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
            style={{ width: '30%' }}
          />
        </div>
      )}

      {/* Header area: breadcrumb context + page title for content-management flow. */}
      <div className="flex flex-col gap-2 mb-8">
        <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl uppercase tracking-tighter">
          Content Management
        </h1>
      </div>

      <div className="mb-8">
        <BackButton />
      </div>

      {/* Cover image hero with immediate preview and optional replacement upload. */}
      <section id="cover" className="relative w-full mb-12 group">
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
      </section>

      {/* Sticky in-page nav keeps long-form editing sections easy to access. */}
      <StickyDossierNav items={navItems} />

      <form className="w-full pb-40">
        {/* Alerts */}
        {successMessage && <div className="mb-4 px-4 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">{successMessage}</div>}
        {errorMessage && <div className="mb-4 px-4 py-3 bg-red-100 text-red-800 rounded-lg font-semibold">{errorMessage}</div>}

        {/* Article meta fields: high-visibility title/genus inputs above detailed sections. */}
        <div className="max-w-full mx-auto px-4 mb-24 mt-20">
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
                  value={wikiMoldInfo.title ?? ""}
                  onChange={(e) => setWikiMoldInfo((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter Title..."
                  className="w-full py-4 bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-5xl font-black placeholder:opacity-10 focus:outline-none transition-all tracking-tighter"
                />
                {/* THE LINE: Static light gray, becomes Accent Color on focus */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--primary-color)]/10 group-focus-within:bg-[var(--accent-color)] transition-colors duration-300" />
              </div>
              
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary-color)]/30 mt-4 italic">
                Public Facing Database Heading
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-4 space-y-20">
          
          {/* 01. DESCRIPTION: primary body content editor for biological overview. */}
          <section id="description" className="scroll-mt-32">
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
                  value={wikiMoldInfo.content ?? ""}
                  onChange={(content) => setWikiMoldInfo((prev) => ({ ...prev, content }))}
                  theme="snow"
                  placeholder="Describe the pathogen characteristics..."
                />
              </div>
            </div>
          </section>

          {/* 02. HOST & PATHOGEN IMPACT SECTION */}
          {/* 4 Fields: Affected Hosts, Symptoms, Disease Cycle, Impact in 2x2 grid */}
          <section id="analysis" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
            <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 02</label>
                <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Host & Pathogen Impact</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* AFFECTED HOSTS/CROPS */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                <div className="flex flex-col gap-2">
                  <h3 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight">Affected Crops / Hosts</h3>
                </div>
                <div className="space-y-4">
                  <ReactQuill
                    value={wikiMoldInfo.affected_hosts ?? ""}
                    onChange={(val) => setWikiMoldInfo((prev) => ({ ...prev, affected_hosts: val }))}
                    theme="snow"
                    placeholder="List of crops that are affected..."
                  />
                </div>
              </div>

              {/* SYMPTOMS & SIGNS */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                <div className="flex flex-col gap-2">
                  <h3 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight">Symptoms & Signs</h3>
                </div>
                <div className="space-y-4">
                  <ReactQuill
                    value={wikiMoldInfo.symptoms ?? ""}
                    onChange={(val) => setWikiMoldInfo((prev) => ({ ...prev, symptoms: val }))}
                    theme="snow"
                    placeholder="Visual symptoms and how to distinguish from other diseases..."
                  />
                </div>
              </div>

              {/* DISEASE CYCLE & SPREAD */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                <div className="flex flex-col gap-2">
                  <h3 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight">Disease Cycle / Spread</h3>
                </div>
                <div className="space-y-4">
                  <ReactQuill
                    value={wikiMoldInfo.disease_cycle ?? ""}
                    onChange={(val) => setWikiMoldInfo((prev) => ({ ...prev, disease_cycle: val }))}
                    theme="snow"
                    placeholder="Transmission methods and favorable environmental conditions..."
                  />
                </div>
              </div>

              {/* IMPACT ANALYSIS */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
                <div className="flex flex-col gap-2">
                  <h3 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight">Impact</h3>
                </div>
                <div className="space-y-4">
                  <ReactQuill
                    value={wikiMoldInfo.impact ?? ""}
                    onChange={(val) => setWikiMoldInfo((prev) => ({ ...prev, impact: val }))}
                    theme="snow"
                    placeholder="Economic damage and health risks (mycotoxins)..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 03. PREVENTION SECTION */}
          {/* Prevention Strategies in separate section */}
          <section id="prevention" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
            <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 03</label>
                <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Prevention</h2>
            </div>
            <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent">
              <div className="flex flex-col gap-2">
                <h3 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight">Prevention Strategies</h3>
              </div>
              <div className="space-y-4">
                <ReactQuill
                  value={wikiMoldInfo.prevention ?? ""}
                  onChange={(val) => setWikiMoldInfo((prev) => ({ ...prev, prevention: val }))}
                  theme="snow"
                  placeholder="Cultural practices and environmental controls..."
                />
              </div>
            </div>
          </section>

          {/* 04. TREATMENT CONTROLS: separate remediation strategies per control category. */}
          <section id="treatments" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
            <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Section 04</label>
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
                  <div className="space-y-4">
                    <ReactQuill
                      value={wikiMoldInfo.treatments[key as keyof WikiMoldDetail["treatments"]] || ""}
                      onChange={(val) => setWikiMoldInfo((prev) => ({
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
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Floating actions keep save/archive available while editing long content blocks. */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setIsArchiveModalOpen(true); }}
            disabled={isArchiving || loading}
            className="flex items-center gap-2 bg-[var(--moldify-blue)] text-white font-black uppercase tracking-[0.2em] px-8 py-5 rounded-full hover:scale-105 transition-all text-xs shadow-2xl border-2 border-white/20 cursor-pointer disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faArchive} />
            Archive
          </button>
          <button
            type="submit"
            onClick={(e) => { e.preventDefault(); handlePublish(); }}
            disabled={isPublishing || !wikiMoldInfo.title.trim()}
            className="flex items-center gap-4 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full hover:scale-105 transition-all text-xs shadow-2xl border-2 border-white/20 cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? "Syncing..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Quill global styling standardizes editor chrome across all section editors. */}
      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid rgba(var(--primary-rgb), 0.1) !important; padding: 0 0 1rem 0 !important; margin-bottom: 1rem !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: var(--font-bricolage-grotesque) !important; color: var(--primary-color) !important; font-size: 1.1rem !important; min-height: 200px !important; padding: 0 !important; }
        .ql-editor.ql-blank::before { color: var(--primary-color) !important; opacity: 0.2 !important; left: 0 !important; }
      `}</style>
      
      <ConfirmModal
        isOpen={isArchiveModalOpen}
        title="Archive WikiMold?"
        subtitle="This will hide the article from the public database."
        onCancel={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchive}
      />
    </main>
  );
}