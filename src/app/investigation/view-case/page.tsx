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
import { useMoldReport, useMoldCaseByReport, useMoldCaseLogs, useUser } from "@/hooks/swr";
import { apiMutate } from "@/lib/api";
import { useInvalidationFunctions } from '@/utils/cache-invalidation';

type Mycologist = {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
  id?: string;
};

function ViewCaseContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('id');
  const { invalidateMoldReports } = useInvalidationFunctions();
  
  /* ── SWR: mold report + mold case ── */
  const { data: reportRes, isLoading: reportLoading, mutate: mutateReport } = useMoldReport(caseId ?? undefined);
  const { data: moldCaseRes, isLoading: moldCaseLoading, mutate: mutateMoldCase } = useMoldCaseByReport(caseId ?? undefined);

  const caseData = reportRes?.data ?? null;
  const moldCase = moldCaseRes?.data ?? null;
  const moldCaseId = moldCase?.id;
  const { data: logsRes, isLoading: logsLoading } = useMoldCaseLogs(moldCaseId, 200, !!moldCaseId);
  
  /* ── SWR: fetch mycologist by ID if assigned ── */
  const mycologistId = caseData?.assigned_mycologist_id;
  const { data: mycologistRes } = useUser(mycologistId);
  const mycologistData = mycologistRes?.data;
  
  const loading = reportLoading || moldCaseLoading || (!!moldCaseId && logsLoading);
  const error = !caseId ? 'No case ID provided' : null;

  /* ── UI modal state ── */
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isConfirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [isAddTreatmentOpen, setAddTreatmentOpen] = useState(false);

  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pendingAssign, setPendingAssign] = useState<{ mycologist: Mycologist; endDate: Date | null } | null>(null);

  // Called from AssignCaseModal -> opens confirmation modal
  const handleAssignClick = (mycologist: Mycologist, endDate: Date | null) => {
    setAssignError(null);
    setPendingAssign({ mycologist, endDate });
    setConfirmAssignOpen(true);
  };

  // Called from confirmation modal -> finalize assignment
  const handleConfirmAssign = useCallback(async () => {
    if (!pendingAssign || !caseId || !caseData) return;

    try {
      setAssignError(null);
      setIsAssigning(true);

      // Assigning a report auto-creates the mold case on backend.
      await apiMutate(`/api/v1/mold-reports/${caseId}/assign`, {
        method: 'PATCH',
        body: {
          assigned_mycologist_id: pendingAssign.mycologist.id,
          end_date: pendingAssign.endDate?.toISOString(),
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
                  status: 'in progress',
                  assigned_mycologist_id: pendingAssign.mycologist.id,
                },
              }
            : current,
        { revalidate: true }, // confirm with a background refetch once Redis is cleared
      );

      await mutateMoldCase(undefined, { revalidate: true });
      await invalidateMoldReports();
    } catch (err: any) {
      console.error('Assignment failed:', err);
      setAssignError(err?.message || 'Failed to assign case');
    } finally {
      setIsAssigning(false);
    }
  }, [pendingAssign, caseId, caseData, mutateReport, mutateMoldCase]);

  const handleReject = useCallback(async () => {
    if (!caseId) return;

    try {
      const rejectionReason = window.prompt('Enter rejection reason:')?.trim();
      if (!rejectionReason) {
        alert('Rejection reason is required.');
        return;
      }

      await apiMutate(`/api/v1/mold-reports/${caseId}/reject`, {
        method: 'PATCH',
        body: { rejection_reason: rejectionReason },
      });

      setRejectModalOpen(false);

      // Optimistically update status then confirm with a background refetch
      await mutateReport(
        (current: any) =>
          current
            ? { ...current, data: { ...current.data, status: 'rejected' } }
            : current,
        { revalidate: true },
      );

      await invalidateMoldReports();
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
  
  // Helper function to get status color (matching status_tile.tsx)
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "var(--accent-color)";
      case "in progress":
        return "var(--moldify-blue)";
      case "resolved":
        return "var(--primary-color)";
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
  const isRejected = caseData?.status === 'rejected';
  const isApproved = caseData?.status === 'resolved' && !!moldCase;
  
  // Get mycologist name from fetched user data
  const assignedMycologistName =
    mycologistData?.details?.displayName
    || mycologistData?.user?.displayName
    || moldCase?.mycologist_name
    || "Assigned Specialist";

  // Get mycologist occupation
  const assignedMycologistOccupation =
    mycologistData?.user?.occupation
    || "Mycologist";

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

  const asText = (...values: unknown[]): string => {
    for (const value of values) {
      if (value === null || value === undefined) continue;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > 0) return trimmed;
        continue;
      }
      if (typeof value === "number") {
        return String(value);
      }
      if (typeof value === "boolean") {
        return value ? "true" : "false";
      }
      if (Array.isArray(value)) {
        const joined = value.map((item) => asText(item)).filter(Boolean).join(", ");
        if (joined.length > 0) return joined;
      }
    }
    return "";
  };

  const asTextList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((item) => asText(item))
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const text = asText(value);
    if (!text) return [];
    return [text];
  };

  const formatLogDate = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
    }

    if (typeof value === "object" && value !== null && "_seconds" in value) {
      const seconds = (value as { _seconds?: number })._seconds;
      if (typeof seconds === "number") {
        return new Date(seconds * 1000).toLocaleString();
      }
    }

    return "";
  };

  const confidenceText = (rawConfidence: unknown): string => {
    if (rawConfidence === null || rawConfidence === undefined) return "";
    if (typeof rawConfidence === "number") {
      const value = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
      return `${Math.round(value)}%`;
    }

    const text = asText(rawConfidence);
    if (!text) return "";
    return text.includes("%") ? text : `${text}%`;
  };

  const normalizeCharacteristics = (value: unknown): Record<string, any> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, any>;
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, any>;
        }
      } catch {
        return {};
      }
    }
    return {};
  };

  const hasMicroscopicEvidence = (characteristics: Record<string, any>): boolean => {
    return asText(
      characteristics?.microscopic_identification,
      characteristics?.identified_mold,
      characteristics?.identifiedMold,
      characteristics?.confidence,
      characteristics?.top_predictions,
    ).length > 0;
  };

  const hasMacroscopicEvidence = (characteristics: Record<string, any>): boolean => {
    return asText(
      characteristics?.size,
      characteristics?.lesion_size,
      characteristics?.colony_diameter,
      characteristics?.color,
      characteristics?.lesion_color,
      characteristics?.colony_color,
      characteristics?.texture,
      characteristics?.lesion_texture,
      characteristics?.colony_texture,
      characteristics?.symptoms,
      characteristics?.characteristics,
    ).length > 0;
  };

  const cultivationDetails = normalizeCharacteristics(moldCase?.cultivation_details);
  const cultivationLogsFromEndpoint = Array.isArray(logsRes?.data?.snapshot) ? logsRes!.data!.snapshot : [];
  const cultivationLogsFromCase = Array.isArray(moldCase?.cultivation_logs) ? moldCase.cultivation_logs : [];
  const cultivationLogs = cultivationLogsFromEndpoint.length > 0
    ? cultivationLogsFromEndpoint
    : cultivationLogsFromCase;
  const startDateText = moldCase?.start_date
    ? `Started: ${toDate(moldCase.start_date)?.toLocaleString() ?? ""}`
    : "";

  const normalizeLogType = (rawType: unknown): string => {
    const text = asText(rawType).toLowerCase().replace(/[_\s-]+/g, "");
    if (text === "vivo" || text === "invivo") return "vivo";
    if (text === "vitro" || text === "invitro") return "vitro";
    return text;
  };

  // In vitro content
  /**
   * In Vitro content handler - displays cultivation observations with microscopic & macroscopic data
   * TODO: Map real observations from moldCase.cultivation_details?.vitro_observations when backend ready
   */
  const getInVitroContent = () => {
    const vitroLogs = cultivationLogs.filter((log: any) => normalizeLogType(log?.type) === "vitro");
    const observations = vitroLogs.map((log: any) => {
      const characteristics = normalizeCharacteristics(log?.characteristics);
      const isMicro = hasMicroscopicEvidence(characteristics);
      const isMacro = hasMacroscopicEvidence(characteristics);

      return {
        date: formatLogDate(log?.created_at) || formatLogDate(log?.metadata?.created_at),
        microscopicImagePath: asText(
          log?.microscopic_image_url,
          characteristics?.microscopic_image_url,
          isMicro ? log?.image_url : "",
          Array.isArray(log?.microscopic_image_urls) ? log.microscopic_image_urls[0] : "",
        ),
        identifiedMold: asText(
          characteristics?.identified_mold,
          characteristics?.identifiedMold,
          characteristics?.microscopic_identification,
        ),
        confidence: confidenceText(characteristics?.confidence),
        macroscopicImagePath: asText(
          log?.macroscopic_image_url,
          characteristics?.macroscopic_image_url,
          isMacro ? log?.image_url : "",
          Array.isArray(log?.image_urls) ? log.image_urls[0] : "",
        ),
        macroColor: asText(characteristics?.macro_color, characteristics?.macroColor, characteristics?.color),
        macroTexture: asText(characteristics?.macro_texture, characteristics?.macroTexture, characteristics?.texture),
        macroSymptoms: asTextList(
          characteristics?.macro_symptoms ?? characteristics?.macroSymptoms ?? characteristics?.symptoms,
        ),
        macroCharacteristics: asTextList(
          characteristics?.macro_characteristics ??
            characteristics?.macroCharacteristics ??
            characteristics?.characteristics,
        ),
      };
    });

    return (
      <InVitroTab
        dateTime={startDateText}
        observations={observations}
        emptyMessage={
          isAssigned
            ? "Mycologist assigned. No in vitro observations recorded yet."
            : "No mycologist assigned to this case yet"
        }
      />
    );
  };

  /**
   * In Vivo content handler - displays field observations with microscopic & macroscopic data
   * TODO: Map real observations from moldCase.cultivation_details?.vivo_observations when backend ready
   */
  const getInVivoContent = () => {
    const vivoLogs = cultivationLogs.filter((log: any) => normalizeLogType(log?.type) === "vivo");
    const observations = vivoLogs.map((log: any) => {
      const characteristics = normalizeCharacteristics(log?.characteristics);
      const isMicro = hasMicroscopicEvidence(characteristics);
      const isMacro = hasMacroscopicEvidence(characteristics);

      return {
        date: formatLogDate(log?.created_at) || formatLogDate(log?.metadata?.created_at),
        microscopicImagePath: asText(
          log?.microscopic_image_url,
          characteristics?.microscopic_image_url,
          isMicro ? log?.image_url : "",
          Array.isArray(log?.microscopic_image_urls) ? log.microscopic_image_urls[0] : "",
        ),
        identifiedMold: asText(
          characteristics?.identified_mold,
          characteristics?.identifiedMold,
          characteristics?.microscopic_identification,
        ),
        confidence: confidenceText(characteristics?.confidence),
        macroscopicImagePath: asText(
          log?.macroscopic_image_url,
          characteristics?.macroscopic_image_url,
          isMacro ? log?.image_url : "",
          Array.isArray(log?.image_urls) ? log.image_urls[0] : "",
        ),
        macroColor: asText(characteristics?.macro_color, characteristics?.macroColor, characteristics?.color),
        macroTexture: asText(characteristics?.macro_texture, characteristics?.macroTexture, characteristics?.texture),
        macroSymptoms: asTextList(
          characteristics?.macro_symptoms ?? characteristics?.macroSymptoms ?? characteristics?.symptoms,
        ),
        macroCharacteristics: asTextList(
          characteristics?.macro_characteristics ??
            characteristics?.macroCharacteristics ??
            characteristics?.characteristics,
        ),
      };
    });

    return (
      <InVivoTab
        dateTime={startDateText}
        observations={observations}
        emptyMessage={
          isAssigned
            ? "Mycologist assigned. No in vivo observations recorded yet."
            : "No mycologist assigned to this case yet"
        }
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
    const initialObs = normalizeCharacteristics(cultivationDetails?.initial_observations ?? cultivationDetails);
    const snapshot = normalizeCharacteristics(initialObs?.microscopic_ai_snapshot ?? cultivationDetails?.microscopic_ai_snapshot);
    const snapshotTopPrediction = Array.isArray(snapshot?.top_predictions) && snapshot.top_predictions.length > 0
      ? normalizeCharacteristics(snapshot.top_predictions[0])
      : {};

    const initialLog = cultivationLogs.find((log: any) => {
      const normalized = normalizeLogType(log?.type);
      return normalized === "initial" || normalized === "initialobservation" || normalized === "initialobs";
    }) as Record<string, any> | undefined;
    const initialLogCharacteristics = normalizeCharacteristics(initialLog?.characteristics);

    const microscopicImagePath = asText(
      initialObs?.initial_microscopic_image_url,
      initialObs?.microscopic_image_path,
      initialObs?.microscopic_image_url,
      cultivationDetails?.initial_microscopic_image_url,
      initialLog?.microscopic_image_url,
      initialLogCharacteristics?.microscopic_image_url,
      initialLog?.image_url,
    );
    const identifiedMold = asText(
      initialObs?.initial_microscopic,
      cultivationDetails?.initial_microscopic,
      initialObs?.identified_mold,
      initialObs?.identifiedMold,
      initialObs?.microscopic_ai_snapshot?.identified_mold,
      snapshot?.identified_mold,
      snapshotTopPrediction?.moldName,
      snapshotTopPrediction?.mold_name,
      initialLogCharacteristics?.microscopic_identification,
      initialLogCharacteristics?.identified_mold,
      initialLogCharacteristics?.identifiedMold,
    );
    const confidence = confidenceText(
      initialObs?.confidence ??
      initialObs?.microscopic_ai_snapshot?.confidence ??
      cultivationDetails?.microscopic_ai_snapshot?.confidence ??
      cultivationDetails?.confidence ??
      snapshot?.confidence ??
      snapshotTopPrediction?.confidence ??
      initialLogCharacteristics?.confidence,
    );
    const macroscopicImagePath = asText(
      initialObs?.initial_macroscopic_image_url,
      initialObs?.macroscopic_image_path,
      initialObs?.macroscopic_image_url,
      cultivationDetails?.initial_macroscopic_image_url,
      initialLog?.macroscopic_image_url,
      initialLogCharacteristics?.macroscopic_image_url,
      initialLog?.image_url,
    );
    const macroColor = asText(
      initialObs?.initial_macroscopic_color,
      initialObs?.macro_color,
      initialObs?.macroColor,
      cultivationDetails?.initial_macroscopic_color,
      initialLogCharacteristics?.macro_color,
      initialLogCharacteristics?.macroColor,
      initialLogCharacteristics?.color,
    );
    const macroTexture = asText(
      initialObs?.initial_macroscopic_texture,
      initialObs?.macro_texture,
      initialObs?.macroTexture,
      cultivationDetails?.initial_macroscopic_texture,
      initialLogCharacteristics?.macro_texture,
      initialLogCharacteristics?.macroTexture,
      initialLogCharacteristics?.texture,
    );
    const macroSymptoms = asTextList(
      initialObs?.initial_macroscopic_symptoms ??
      initialObs?.macro_symptoms ??
      initialObs?.initial_symptoms ??
      cultivationDetails?.initial_macroscopic_symptoms ??
      cultivationDetails?.initial_symptoms ??
      initialLogCharacteristics?.macro_symptoms ??
      initialLogCharacteristics?.macroSymptoms ??
      initialLogCharacteristics?.symptoms,
    );
    const macroCharacteristics = asTextList(
      initialObs?.initial_macroscopic_characteristics ??
      initialObs?.macro_characteristics ??
      initialObs?.initial_characteristics ??
      cultivationDetails?.initial_macroscopic_characteristics ??
      cultivationDetails?.initial_characteristics ??
      initialLogCharacteristics?.macro_characteristics ??
      initialLogCharacteristics?.macroCharacteristics ??
      initialLogCharacteristics?.characteristics,
    );

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
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] mt-1">{(caseData?.reporter as any)?.occupation || "Farmer"}</span>
                
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
              assignedMycologistOccupation={assignedMycologistOccupation}
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
             
            </div>

            {/* 5. DATA TABS */}
            <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5">
              <TabBar tabs={tabs} initialIndex={0} />
            </div>
          </section>
        </div>
      )}

      {/* Error Alert */}
      {assignError && (
        <div className="fixed top-4 right-4 max-w-md bg-red-100 border-2 border-red-500 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-red-800">Assignment Failed</h3>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-red-700 mt-1">{assignError}</p>
            </div>
            <button
              onClick={() => setAssignError(null)}
              className="flex-shrink-0 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
        confirmDisabled={isAssigning}
        confirmLoadingText="Assigning..."
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