"use client";

import { useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import TabBar from "@/components/tab_bar";
import CaseStatusCard from "@/components/CaseStatusCard";
import AssignCaseModal from "@/components/modals/assign_case_modal";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { faSeedling, faClipboardList, faClockRotateLeft, faFilePdf, faFlask, faSprayCan, faPlus, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaseDetailsTab from "../investigation-tabs/case_details";
import InVitroTab from "../investigation-tabs/in_vitro";
import InVivoTab from "../investigation-tabs/in_vivo";
import InitialObservationTab from "../investigation-tabs/initial_observation";
import AddTreatmentModal from "@/components/modals/add_treatment_modal";
import { useAuth } from "@/hooks/useAuth";
import { useMoldReport, useMoldCaseByReport, useUser } from "@/hooks/swr";
import { apiMutate } from "@/lib/api";
import { mutate } from 'swr';

type Mycologist = {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
  id?: string;
};

function ViewCaseContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('id');
  const priorityFromQuery = searchParams.get('priority');
  
  /* ── SWR: mold report + mold case ── */
  const { data: reportRes, isLoading: reportLoading, mutate: mutateReport } = useMoldReport(caseId ?? undefined);
  const { data: moldCaseRes, isLoading: moldCaseLoading, mutate: mutateMoldCase } = useMoldCaseByReport(caseId ?? undefined);

  const caseData = reportRes?.data ?? null;
  const moldCase = moldCaseRes?.data ?? null;
  
  /* ── SWR: fetch mycologist by ID if assigned ── */
  const mycologistId = caseData?.assigned_mycologist_id;
  const { data: mycologistRes } = useUser(mycologistId);
  const mycologistData = mycologistRes?.data;
  
  const loading = reportLoading || moldCaseLoading;
  const error = !caseId ? 'No case ID provided' : null;

  /* ── UI modal state ── */
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isConfirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [isAddTreatmentOpen, setAddTreatmentOpen] = useState(false);

  const [pendingAssign, setPendingAssign] = useState<{ mycologist: Mycologist; priority: string; endDate: Date | null } | null>(null);

  // Called from AssignCaseModal -> opens confirmation modal
  const handleAssignClick = (mycologist: Mycologist, priority: string, endDate: Date | null) => {
    setPendingAssign({ mycologist, priority, endDate });
    setConfirmAssignOpen(true);
  };

  // Called from confirmation modal -> finalize assignment
  const handleConfirmAssign = useCallback(async () => {
    if (!pendingAssign || !caseId || !caseData) return;

    try {
      // Step 1: PATCH to assign mycologist to the mold-report
      await apiMutate(`/api/v1/mold-reports/${caseId}/assign`, {
        method: 'PATCH',
        body: { assigned_mycologist_id: pendingAssign.mycologist.id },
      });

      // Step 2: POST to create a mold-case
      await apiMutate('/api/v1/mold-cases', {
        method: 'POST',
        body: {
          mycologist_id: pendingAssign.mycologist.id,
          name: caseData.case_name,
          mold_report_id: caseId,
          photo_url: caseData.case_details?.[0]?.cover_photo || "",
          priority: pendingAssign.priority,
          start_date: new Date().toISOString(),
          end_date: pendingAssign.endDate
            ? pendingAssign.endDate.toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cultivation_details: {
            in_vivo_details: {},
            in_vitro_details: {},
          },
          cultivation_logs: [],
          is_archived: false,
        },
      });

      setPendingAssign(null);
      setConfirmAssignOpen(false);
      setAssignModalOpen(false);

      // Optimistically update the single-report cache immediately so the UI reflects
      // in_progress status without waiting for the backend Redis cache to clear.
      await mutateReport(
        (current: any) =>
          current
            ? {
                ...current,
                data: {
                  ...current.data,
                  status: 'in_progress',
                  assigned_mycologist_id: pendingAssign.mycologist.id,
                },
              }
            : current,
        { revalidate: true }, // confirm with a background refetch once Redis is cleared
      );

      // Revalidate list-level caches — include $inf$ prefix for useSWRInfinite keys
      await Promise.all([
        mutateMoldCase(undefined, { revalidate: true }),
        mutate(
          (key: unknown) =>
            typeof key === 'string' &&
            (key.startsWith('/api/v1/mold-reports') || key.startsWith('$inf$/api/v1/mold-reports')),
          undefined,
          { revalidate: true },
        ),
        mutate(
          (key: unknown) =>
            typeof key === 'string' &&
            (key.startsWith('/api/v1/mold-cases') || key.startsWith('$inf$/api/v1/mold-cases')),
          undefined,
          { revalidate: true },
        ),
      ]);
    } catch (err: any) {
      console.error('Assignment failed:', err);
      alert(err?.message || 'Failed to assign case');
    }
  }, [pendingAssign, caseId, caseData, mutateReport, mutateMoldCase]);

  const handleReject = useCallback(async () => {
    if (!caseId) return;

    try {
      await apiMutate(`/api/v1/mold-reports/${caseId}/reject`, {
        method: 'PATCH',
        body: {},
      });

      setRejectModalOpen(false);

      // Optimistically update status then confirm with a background refetch
      await mutateReport(
        (current: any) =>
          current
            ? { ...current, data: { ...current.data, status: 'closed' } }
            : current,
        { revalidate: true },
      );

      // Revalidate list caches — include $inf$ prefix for useSWRInfinite
      await mutate(
        (key: unknown) =>
          typeof key === 'string' &&
          (key.startsWith('/api/v1/mold-reports') || key.startsWith('$inf$/api/v1/mold-reports')),
        undefined,
        { revalidate: true },
      );
    } catch (err: any) {
      console.error('Rejection failed:', err);
      alert(err?.message || 'Failed to reject case');
    }
  }, [caseId, mutateReport]);

  type UserRole = "Administrator" | "Mycologist";
  const { user: authUser } = useAuth();

  const rawRole = (authUser?.user?.role || authUser?.role || "").toLowerCase();
  const userRole: UserRole = rawRole === "mycologist" ? "Mycologist" : "Administrator";

  /** Convert Firestore timestamp or ISO string to Date */
  const toDate = (v: string | { _seconds: number } | undefined): Date | null => {
    if (!v) return null;
    if (typeof v === 'string') return new Date(v);
    return new Date(v._seconds * 1000);
  };

  // Use data from API
  const caseName = caseData?.case_name || "Loading...";
  const cropName = caseData?.host || "Loading...";
  const location = caseData?.location || "Loading...";
  const dateObserved = (() => {
    const d = toDate(caseData?.date_observed);
    return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Loading...";
  })();
  const status = caseData?.status ? caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1) : "Pending";
  const priorityValue = moldCase?.priority || caseData?.mold_case?.priority || caseData?.priority || priorityFromQuery || "";
  const priority = priorityValue
    ? priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1)
    : "Unknown";
  
  // Helper function to get status color (matching status_tile.tsx)
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "var(--accent-color)";
      case "in progress":
        return "var(--moldify-blue)";
      case "resolved":
        return "var(--primary-color)";
      case "closed":
        return "var(--moldify-grey)";
      case "rejected":
        return "var(--moldify-red)";
      default:
        return "rgba(0, 0, 0, 0.15)";
    }
  };
  
  // Reporter info
  const reporterName = caseData?.reporter?.details?.displayName || "Loading...";
  const reporterEmail = caseData?.reporter?.details?.email || "N/A";
  const reporterPhone = caseData?.reporter?.details?.phone_number || "N/A";
  const imageUrl = caseData?.reporter?.details?.photo_url || "/profile-placeholder.svg";

  // IMPORTANT: Derive state from backend data, not local state
  const isAssigned = !!caseData?.assigned_mycologist_id;
  // Treat explicit 'rejected' as rejection. If status is 'closed' and a MoldCase exists
  // (i.e. mycologist was assigned and worked the case), treat as approved/closed by farmer.
  const isRejected = caseData?.status === 'rejected';
  const isApproved = caseData?.status === 'closed' && !!moldCase;
  
  // Get mycologist name from fetched user data
  const assignedMycologistName = 
    mycologistData?.details?.displayName 
    || mycologistData?.user?.displayName 
    || moldCase?.mycologist_name 
    || "Assigned Specialist";

  // Normalize case_details
  const caseDetailsEntries = (caseData?.case_details ?? []).map((d: any) => {
    const createdSec = d?.metadata?.created_at?._seconds;
    const date = createdSec
      ? new Date(createdSec * 1000).toLocaleString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      : (d?.created_at ? new Date(d.created_at).toLocaleString() : "");

    return {
      date,
      notes: d?.description || "",
      images: d?.cover_photo ? (Array.isArray(d.cover_photo) ? d.cover_photo : [d.cover_photo]) : [],
    };
  });

  // In vitro content
  /**
   * In Vitro content handler - displays cultivation observations with microscopic & macroscopic data
   * TODO: Map real observations from moldCase.cultivation_details?.vitro_observations when backend ready
   */
  const getInVitroContent = () => {
    const startDate = moldCase?.start_date ? `Started: ${toDate(moldCase.start_date)?.toLocaleString() ?? ""}` : "";
    return (
      <InVitroTab
        dateTime={startDate}
        observations={[]}
        emptyMessage="No in vitro observations recorded yet"
      />
    );
  };

  /**
   * In Vivo content handler - displays field observations with microscopic & macroscopic data
   * TODO: Map real observations from moldCase.cultivation_details?.vivo_observations when backend ready
   */
  const getInVivoContent = () => {
    const observationPeriod = moldCase?.start_date ? `Started: ${toDate(moldCase.start_date)?.toLocaleString() ?? ""}` : "";
    return (
      <InVivoTab
        dateTime={observationPeriod}
        observations={[]}
        emptyMessage="No in vivo observations recorded yet"
      />
    );
  };

  /**
   * getInitialObservationContent
   * 
   * Prepares and returns the InitialObservationTab component with formatted data from the mold case.
   * 
   * Currently uses mock data for UI visualization. When backend ready, replace mockInitialObs
   * with actual API data from moldCase.cultivation_details.initial_observations
   * 
   * Expected backend data structure:
   * moldCase.cultivation_details = {
   *   initial_observations?: {
   *     microscopic_image_path: string
   *     identified_mold: string
   *     confidence: string
   *     macroscopic_image_path: string
   *     macro_color: string
   *     macro_texture: string
   *     macro_symptoms: string
   *     macro_characteristics: string
   *   }
   * }
   * 
   * TODO: Remove mockInitialObs and replace with:
   * const initialObs = (moldCase?.cultivation_details as any)?.initial_observations || {};
   * 
   * @returns {JSX.Element} InitialObservationTab with microscopic/macroscopic baseline data
   */
  const getInitialObservationContent = () => {
    /**
     * MOCK DATA FOR UI VISUALIZATION
     * Replace this entire mockInitialObs object with real data from backend when ready
     */
    const mockInitialObs = {
      microscopic_image_path: "/assets/images/microscopic-sample-001.jpg",
      identified_mold: "Aspergillus fumigatus",
      confidence: "92%",
      macroscopic_image_path: "/assets/images/macroscopic-sample-001.jpg",
      macro_color: "White with yellow discoloration",
      macro_texture: "Powdery, granular appearance",
      macro_symptoms: "Leaf necrosis, wilting, stunted growth",
      macro_characteristics: "Rapid spread, airborne spores, warm weather preference",
    };

    /**
     * TODO: FETCH-READY SWAP
     * When backend is ready, uncomment this line and remove mockInitialObs usage:
     * const initialObs = (moldCase?.cultivation_details as any)?.initial_observations || {};
     * 
     * Then replace all mockInitialObs references below with initialObs
     */

    const microscopicImagePath = mockInitialObs.microscopic_image_path || "";
    const identifiedMold = mockInitialObs.identified_mold || "";
    const confidence = mockInitialObs.confidence || "";
    const macroscopicImagePath = mockInitialObs.macroscopic_image_path || "";
    const macroColor = mockInitialObs.macro_color || "";
    const macroTexture = mockInitialObs.macro_texture || "";
    const macroSymptoms = mockInitialObs.macro_symptoms || "";
    const macroCharacteristics = mockInitialObs.macro_characteristics || "";

    return (
      <InitialObservationTab
        microscopicImagePath={microscopicImagePath}
        macroscopicImagePath={macroscopicImagePath}
        identifiedMold={identifiedMold}
        confidence={confidence}
        macroColor={macroColor}
        macroTexture={macroTexture}
        macroSymptoms={macroSymptoms}
        macroCharacteristics={macroCharacteristics}
        emptyMicroscopicMessage="No microscopic analysis recorded"
        emptyMacroscopicMessage="No macroscopic analysis recorded"
      />
    );
  };

  // Tabs
  const tabs = [
    {
      label: "Case Details",
      icon: faClipboardList,
      content: (
        <CaseDetailsTab
          entries={caseDetailsEntries}
        />
      ),
    },
    {
      label: "Initial Observation",
      icon: faEye,
      content: getInitialObservationContent(),
    },
    {
      label: "In Vitro",
      icon: faFlask,
      content: getInVitroContent(),
    },
    {
      label: "In Vivo",
      icon: faSeedling,
      content: getInVivoContent(),
    },
  ];
  
  const [imgSrc, setImgSrc] = useState(imageUrl);

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
      
      {/* 1. MINIMALIST TOP NAV */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <Breadcrumbs role={userRole} />
          <div className="flex items-center gap-4">
            <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-4xl uppercase tracking-tighter">
              Case Management
            </h1>
          </div>
        </div>

      </header>
       {/* Back Button */}
      <div className="mb-3">
        <BackButton />
      </div>

      {!loading && !error && caseData && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Sidebar Info (Farmer + Metadata) */}
          <aside className="xl:col-span-4 space-y-6">
            
            {/* Farmer Profile Card - Earthy & Modern */}
            <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden mb-4 border-4 border-[var(--taupe)] shadow-md">
                   <Image
                    key={imgSrc}
                    src={imgSrc}
                    alt="Profile"
                    fill
                    className="object-cover "
                    onError={() => setImgSrc("/assets/default-fallback.png")}
                  />
                </div>
                <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase">{reporterName}</h2>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] mt-1">Farmer</span>
                
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--primary-color)]/10 to-transparent my-6" />
                
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-[family-name:var(--font-montserrat)] font-bold opacity-40">Email</span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-[var(--primary-color)]">{reporterEmail}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-[family-name:var(--font-montserrat)] font-bold opacity-40">Phone</span>
                    <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-[var(--primary-color)]">{reporterPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Status Card */}
            <CaseStatusCard
              userRole={userRole}
                isAssigned={isAssigned}
                isRejected={isRejected}
                isApproved={isApproved}
              assignedMycologistName={assignedMycologistName}
              caseData={caseData}
              status={status}
              setAssignModalOpen={setAssignModalOpen}
              setRejectModalOpen={setRejectModalOpen}
              mycologistLoading={!mycologistId || !mycologistRes}
            />
          </aside>

          {/* RIGHT COLUMN: Case Core Data */}
          <section className="xl:col-span-8 space-y-4">
  
          {/* MINIMALIST STATUS LINE - No boxes, just clean typography on the cream bg */}
          <div className="font-[family-name:var(--font-montserrat)] flex items-center gap-6 px-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary-color)]">
                {status}
              </span>
            </div>
            
            <div className="w-[1px] h-3 bg-[var(--primary-color)]/20" />
            
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-[0.2em] opacity-60">Priority:</span>
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${priority === 'High' ? 'text-red-700' : 'text-[var(--primary-color)]'}`}>
                {priority}
              </span>
            </div>
          </div>

          {/* THE ACTUAL HERO CARD - Now completely clean */}
          <div className="bg-[var(--primary-color)] text-[var(--background-color)] rounded-[2.5rem] p-12 relative overflow-hidden">
            <FontAwesomeIcon icon={faSeedling} className="absolute -right-10 -bottom-10 text-white/5 text-[18rem]" />
            
            <div className="relative z-10">
              <h2 className="text-5xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter leading-[0.9] mb-12">
                {caseName}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-10 border-t border-white/10">
                <div>
                  <span className="block font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest opacity-50 mb-2">Host Crop</span>
                  <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold">{cropName}</p>
                </div>
                <div>
                  <span className="block font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest opacity-50 mb-2">Location</span>
                  <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold">{location}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="block font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest opacity-50 mb-2">Log Date</span>
                  <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold">{dateObserved}</p>
                </div>
              </div>
            </div>
          </div>

            {/* 4.  UTILITY BAR */}
            <div className="flex flex-wrap gap-3 bg-[var(--taupe)]/30 p-2 rounded-2xl border border-[var(--primary-color)]/5">
              {userRole !== "Administrator" && (
                <button 
                  className="font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase bg-white text-[var(--primary-color)] px-4 py-4 rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm group cursor-pointer"
                  onClick={() => setAddTreatmentOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="group-hover:scale-125 transition-transform" /> Add Treatment
                </button>
              )}
              <button 
                className={`font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase px-4 py-4 rounded-xl transition-all shadow-sm ${
                  caseData?.status?.toLowerCase() === 'resolved'
                    ? 'bg-white text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }`}
                disabled={caseData?.status?.toLowerCase() !== 'resolved'}
                title={caseData?.status?.toLowerCase() !== 'resolved' ? 'PDF export is only available for resolved cases' : 'Export case as PDF'}
              >
                <FontAwesomeIcon icon={faFilePdf} /> Export PDF
              </button>
              <button 
                className="font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase bg-white text-[var(--primary-color)] px-4 py-4 rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm cursor-pointer"
                onClick={() => (window.location.href = "/investigation/identification-history")}
              >
                <FontAwesomeIcon icon={faClockRotateLeft} /> Identification History
              </button>
              <button 
                className="font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase bg-white text-[var(--primary-color)] px-4 py-4 rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm cursor-pointer"
                onClick={() => (window.location.href = "/investigation/treatment-history")}
              >
                <FontAwesomeIcon icon={faSprayCan} /> Treatment History
              </button>
            </div>

            {/* 5. DATA TABS */}
            <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5">
              <TabBar tabs={tabs} initialIndex={0} />
            </div>
          </section>
        </div>
      )}
      

      {/* Modals */}
      <AssignCaseModal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        caseId={caseId || undefined}
        onAssign={handleAssignClick}
      />

      <ConfirmModal
        isOpen={isRejectModalOpen}
        title="Are you sure you want to reject this case?"
        subtitle="This action is permanent and cannot be undone."
        cancelText="Cancel"
        confirmText="Yes"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />

      <ConfirmModal
        isOpen={isConfirmAssignOpen}
        title={`Are you sure you want to assign this case to ${pendingAssign?.mycologist.name}?`}
        subtitle="This action is irreversible."
        cancelText="Cancel"
        confirmText="Yes, Assign"
        onCancel={() => setConfirmAssignOpen(false)}
        onConfirm={handleConfirmAssign}
      />
      <AddTreatmentModal
        isOpen={isAddTreatmentOpen}
        onClose={() => setAddTreatmentOpen(false)}
      />
    </main>
  );
}

export default function ViewCase() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewCaseContent />
    </Suspense>
  );
}