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
import { useInvalidationFunctions } from '@/utils/cache-invalidation';
import { StickyDossierNav } from "@/components/dossier_nav";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

/**
 * WikiMoldData: Frontend form data model
 * This shape is sent to the backend POST /api/v1/moldipedia endpoint.
 * All rich-text fields (content, treatments, etc.) are HTML strings from ReactQuill editor.
 * Backend should expect multipart FormData with:
 *   - details: JSON stringified WikiMoldData
 *   - cover_photo: File object for the banner image
 */
interface WikiMoldData {
  // Frontend form model that maps to the payload sent to POST /api/v1/moldipedia.
  title: string; // Mold/Fungi name (e.g., "Powdery Mildew")
  coverImage: string; // Local holder; actual file is in coverImageFile state
  content: string; // Main biological description HTML from ReactQuill
  mold_type: string; // Scientific or common name of the mold classification
  affected_hosts?: string; // List of affected crops/hosts (HTML from editor)
  symptoms?: string; // Visual symptoms and signs of infection (HTML from editor)
  disease_cycle?: string; // How disease spreads and lifecycle info (HTML from editor)
  impact?: string; // Economic/health impact analysis (HTML from editor)
  prevention?: string; // Prevention strategies (HTML from editor)
  treatments: {
    mechanical: string; // Physical removal methods
    cultural: string; // Environmental/habit modifications
    biological: string; // Microbial antagonism approaches
    physical: string; // Temperature/moisture regulation
    chemical: string; // Antimicrobial/fungicide applications
  };
  findings: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * EMPTY_WIKIMOLD_DATA: Default form state
 * Ensures all fields are initialized to avoid undefined values in controlled inputs.
 * Resets form after successful submission.
 */
const EMPTY_WIKIMOLD_DATA: WikiMoldData = {
  // Stable defaults keep all inputs controlled from first render.
  title: "",
  coverImage: "",
  content: "",
  mold_type: "",
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
};

/**
 * AddWikiMold Page Component
 * Handles creation of WikiMold articles (mold/fungi encyclopaedia entries).
 * 
 * Key Features:
 * - Rich text editing with ReactQuill for HTML content
 * - Image upload for cover photo with preview
 * - Multi-section form for biological data and treatment protocols
 * - Unsaved changes detection (warns user before leaving)
 * - Form validation before submission to backend
 *
 * Flow:
 * 1. User fills form fields and uploads cover image
 * 2. User clicks "Publish Article" button
 * 3. Confirmation modal appears
 * 4. On confirm: form validates, FormData is created, API request sent
 * 5. Success: form resets, success message shown
 * 6. Error: error message displayed with details
 */
export default function AddWikiMold() {
  // UI State: Show confirmation modal before publishing
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const { invalidateMoldipedia } = useInvalidationFunctions();
  // Message States: Feedback to user
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Shown when article published successfully
  const [errorMessage, setErrorMessage] = useState(''); // Shown when validation or API fails
  // Form State Tracking: Stores baseline form data for detecting unsaved changes
  // Used to warn user if they try to navigate away with unsaved changes
  const initialData = useRef<WikiMoldData>(EMPTY_WIKIMOLD_DATA);
  const [showConfirm, setShowConfirm] = useState(false); // Publish confirmation modal
  const userRole = "Mycologist"; // Fixed role for breadcrumbs/permissions display
  const fallbackImage = "/assets/wikimold-fallback.png"; // Default image if no cover uploaded
  
  // Main Form Data State: Holds all article content
  const [wikiMoldData, setWikiMoldData] = useState<WikiMoldData>(EMPTY_WIKIMOLD_DATA);
  
  // Cover Image States: Separate tracking for image preview and file upload
  // coverImagePreview: Base64 string for displaying preview in browser
  // coverImageFile: Actual File object sent to backend via FormData
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  
  // API Call State: Prevents multiple submissions and shows loading bar
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { id: 'description', label: '01. Description' },
    { id: 'treatments', label: '02. Treatment Control' },
    { id: 'findings', label: '03. Findings' },
  ]; // Sticky navigation items for quick section jumping

  // Initialize baseline form snapshot for unsaved-changes detection
  // This captures the form state when component mounts
  useEffect(() => {
    // Snapshot baseline form data for unsaved-changes detection.
    initialData.current = { ...wikiMoldData };
  }, []);

  // Detect unsaved changes and prevent page navigation
  // Warns user: "You have unsaved changes" if they try to leave
  // Also prevents accidental data loss with confirmation on back button
  useEffect(() => {
    // TODO: JSON.stringify diffing is simple but can get expensive as editor content grows.
    // Consider dirty flags per section (or a deep-equal helper with memoization) for better scalability.
    const isChanged = JSON.stringify(wikiMoldData) !== JSON.stringify(initialData.current) || !!coverImageFile;
    setInfoMessage(isChanged ? '' : 'You haven\'t made any changes yet.');
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Browser native confirmation: "Leave site without saving?"
      if (isChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [wikiMoldData, coverImageFile]);

  /**
   * Handle cover image selection
   * - Reads file from input
   * - Generates Base64 preview for UI display
   * - Stores actual File object for backend upload via FormData
   */
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

  /**
   * Form Submission Handler
   * 
   * Validation Steps:
   * 1. Check cover image is selected
   * 2. Check title and body are filled
   * 3. Check user is authenticated (has author_id)
   * 
   * Payload Structure (sent as FormData):
   * - details: JSON object containing all article metadata and content
   * - cover_photo: File object (multipart upload)
   * 
   * Backend Expectations:
   * - Endpoint: POST /api/v1/moldipedia
   * - Accept: FormData with JSON 'details' and File 'cover_photo'
   * - Details should be parsed as JSON and flattened if needed
   * - Should store cover_photo in cloud storage (Firebase/Azure)
   * - Should return article ID and success status
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // VALIDATION: Cover image (banner) is mandatory
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

    // VALIDATION: Required fields
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
        affected_hosts: wikiMoldData.affected_hosts?.trim() ?? "",
        symptoms: wikiMoldData.symptoms?.trim() ?? "",
        disease_cycle: wikiMoldData.disease_cycle?.trim() ?? "",
        impact: wikiMoldData.impact?.trim() ?? "",
        prevention: wikiMoldData.prevention?.trim() ?? "",
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

      // Send FormData to backend
      // Backend receives: multipart/form-data with 'details' and 'cover_photo'
      await apiMutate('/api/v1/moldipedia', {
        method: 'POST',
        formData,
      });

      await invalidateMoldipedia();

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

  /**
   * Handle back button click
   * - Checks if form has unsaved changes
   * - If changes exist, shows confirmation modal
   * - If no changes, allows navigation back
   */
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
    {/* LOADING BAR: Shows progress when submitting form */}
    {isSubmitting && (
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
        <div
          className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
          style={{ width: '30%' }}
        />
      </div>
    )}

    {/* MAIN CONTENT WRAPPER */}
    <main className="relative flex flex-col xl:py-2 py-10 w-full font-[family-name:var(--font-bricolage-grotesque)]">
      {/* NAVIGATION: Breadcrumbs and page title */}
      <div className="flex flex-col gap-2 mb-8 px-4">
        <Breadcrumbs role={userRole} skipSegments={["tab-content", "wikimold"]} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl uppercase tracking-tighter">
          Content Management
        </h1>
      </div>

      {/* BACK BUTTON: Navigate away (with unsaved changes check) */}
      <div className="mb-8 px-4">
        <BackButton onClick={handleBack} />
      </div>

      {/* MAIN FORM */}
      <form className="w-full" onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
        
        {/* COVER IMAGE SECTION: Banner image upload with preview */}
        <div className="relative w-full mb-16 group px-4">
          <div className="relative w-full h-[350px] rounded-[2.5rem] overflow-hidden bg-[var(--taupe)] shadow-2xl transition-all duration-700">
            {/* Display cover image preview or fallback image */}
            <Image
              src={coverImagePreview || fallbackImage}
              alt="Cover"
              fill
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
            {/* FILE INPUT: Hidden input for image selection */}
            <label className="font-[family-name:var(--font-bricolage-grotesque)] absolute bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md text-[var(--moldify-black)] px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-color)] hover:text-white transition-all cursor-pointer shadow-2xl border border-white/20">
              <FontAwesomeIcon icon={faPen} />
              Add Cover Image
              <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* STICKY NAVIGATION: Quick access to form sections */}
        <StickyDossierNav items={[
          { id: 'overview', label: 'Overview' },
          { id: 'analysis', label: 'Fungal Analysis' },
          { id: 'prevention', label: 'Prevention' },
          { id: 'management', label: 'Treatments' }
        ]} />

        <div className="max-w-full mx-auto px-4 space-y-32 mt-10">
          
          {/* SECTION 01: OVERVIEW & TITLE */}
          {/* Displays main article title and biological description editor */}
          <section id="overview" className="scroll-mt-32">
              <div className="flex-1 w-full mb-16">
                {/* TITLE INPUT: Main article heading (e.g., "Powdery Mildew") */}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mb-2 block">01. Project Title</span>
                <input
                  type="text"
                  value={wikiMoldData.title}
                  onChange={(e) => setWikiMoldData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter Title..."
                  className="w-full py-4 bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-5xl font-black placeholder:opacity-10 focus:outline-none tracking-tighter border-b-2 border-[var(--primary-color)]/10 focus:border-[var(--accent-color)] transition-all"
                />
              </div>

            {/* CONTENT EDITOR: Main biological description using rich text editor (ReactQuill) */}
            {/* This HTML content is stored and displayed on the public WikiMold view page */}
            <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 bg-transparent space-y-4">
              <h2 className="font-black text-2xl text-[var(--primary-color)] uppercase tracking-tighter">Biological Description</h2>
              <ReactQuill
                value={wikiMoldData.content}
                onChange={(content) => setWikiMoldData((prev) => ({ ...prev, content }))}
                placeholder="Describe the pathogen characteristics..."
              />
            </div>
          </section>

          {/* 4. FUNGAL ANALYSIS PHASE */}
          <section id="analysis" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
            <div className="flex flex-col gap-2 mb-12">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Phase 02</label>
              <h2 className="font-black text-4xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Host & Pathogen Impact</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary-color)]/40 italic">Technical Analysis & Observations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* AFFECTED HOSTS/CROPS: What plants/crops this mold affects */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 space-y-4">
                <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">Affected Crops / Hosts</h3>
                <ReactQuill
                  value={wikiMoldData.affected_hosts || ""}
                  onChange={(val) => setWikiMoldData(prev => ({ ...prev, affected_hosts: val }))}
                  placeholder="List of crops that are affected..."
                />
              </div>
              {/* SYMPTOMS & SIGNS: Visual indicators and signs of infection */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 space-y-4">
                <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">Symptoms & Signs</h3>
                <ReactQuill
                  value={wikiMoldData.symptoms || ""}
                  onChange={(val) => setWikiMoldData(prev => ({ ...prev, symptoms: val }))}
                  placeholder="Visual symptoms and how to distinguish from other diseases..."
                />
              </div>
              {/* DISEASE CYCLE & SPREAD: How the disease spreads and lifecycle info */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 space-y-4">
                <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">Disease Cycle / Spread</h3>
                <ReactQuill
                  value={wikiMoldData.disease_cycle || ""}
                  onChange={(val) => setWikiMoldData(prev => ({ ...prev, disease_cycle: val }))}
                  placeholder="Transmission methods and favorable environmental conditions..."
                />
              </div>
              {/* IMPACT ANALYSIS: Economic damage and health/mycotoxin risks */}
              <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 space-y-4">
                <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">Impact</h3>
                <ReactQuill
                  value={wikiMoldData.impact || ""}
                  onChange={(val) => setWikiMoldData(prev => ({ ...prev, impact: val }))}
                  placeholder="Economic damage and health risks (mycotoxins)..."
                />
              </div>
            </div>
          </section>

          {/* SECTION 03: PREVENTION */}
          {/* Shows prevention and control strategies before moving to treatment */}
          <section id="prevention" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
            <div className="flex flex-col gap-2 mb-12">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40">Phase 03</label>
              <h2 className="font-black text-4xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Prevention</h2>
            </div>
            {/* PREVENTION STRATEGIES: Cultural practices, environmental controls */}
            <div className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 space-y-4">
              <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">Prevention Strategies</h3>
              <ReactQuill
                value={wikiMoldData.prevention || ""}
                onChange={(val) => setWikiMoldData(prev => ({ ...prev, prevention: val }))}
                placeholder="Cultural practices and environmental controls..."
              />
            </div>
          </section>

          {/* SECTION 04: TREATMENT MANAGEMENT */}
          {/* 5 Treatment Control Types: Mechanical, Cultural, Biological, Physical, Chemical */}
          {/* Each control type is displayed as an expandable accordion on the public page */}
          <section id="management" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10 pb-32">
            <div className="flex flex-col gap-2 mb-12">
              <h2 className="font-black text-4xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">Treatment Management</h2>
            </div>
            {/* TREATMENT CONTROL OPTIONS: 5 different control methods */}
            {/* On public page, each expands to show the HTML content entered here */}
            <div className="grid grid-cols-1 gap-12">
              {['mechanical', 'cultural', 'biological', 'physical', 'chemical'].map((key, index) => (
                <div key={key} className="p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-4">
                  <span className="text-[10px] font-black text-[var(--accent-color)] opacity-40 uppercase tracking-widest">Protocol 0{index + 1}</span>
                  <h3 className="font-black text-xl text-[var(--primary-color)] uppercase tracking-tight">{key} Control</h3>
                  {/* TREATMENT EDITOR: HTML content for each control method */}
                  {/* Backend should store these as separate fields or in a treatments object */}
                  <ReactQuill
                    className="flex-1"
                    value={wikiMoldData.treatments[key as keyof typeof wikiMoldData.treatments] || ""}
                    onChange={(val) => setWikiMoldData((prev) => ({
                      ...prev,
                      treatments: { ...prev.treatments, [key]: val },
                    }))}
                    placeholder={`Details for ${key} control...`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <style>{`
          .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; margin-bottom: 1.5rem !important; padding-bottom: 1rem !important; }
          .ql-container.ql-snow { border: none !important; }
          .ql-editor { font-size: 1.15rem !important; line-height: 1.8 !important; min-height: 250px !important; padding: 0 !important; color: var(--moldify-black); font-family: var(--font-bricolage-grotesque); }
          .ql-editor.ql-blank::before { left: 0 !important; font-style: normal !important; opacity: 0.3 !important; }
        `}</style>

        {/* SUBMIT BUTTON: Floating at bottom, triggers confirmation modal */}
        {/* Form submission is prevented, instead opens ConfirmModal for user to approve */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
          <button
            type="submit"
            className="font-[family-name:var(--font-montserrat)] flex items-center gap-4 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:scale-105 transition-all text-xs shadow-2xl border-2 border-white/20 backdrop-blur-md"
          >
            Publish Article
          </button>
        </div>
      </form>

      {/* CONFIRMATION MODAL: Appears when user clicks "Publish Article" */}
      {/* Allows user to review before final submission */}
      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Publish Article"
          subtitle="Are you sure you want to publish this WikiMold article?"
          onConfirm={() => {
            setShowConfirm(false);
            handleSubmit();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ALERTS: Feedback messages shown at bottom of page */}
      {/* Error: Validation or API errors (red background) */}
      {errorMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-bold z-50 shadow-lg">
          {errorMessage}
        </div>
      )}
      {/* Success: Article published successfully (green background) */}
      {successMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-bold z-50 shadow-lg">
          {successMessage}
        </div>
      )}
    </main>
  </>
);
}