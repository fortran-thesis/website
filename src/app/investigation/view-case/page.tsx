"use client";

import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import TabBar from "@/components/tab_bar";
import CaseStatusCard from "@/components/CaseStatusCard";
import AssignCaseModal from "@/components/modals/assign_case_modal";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { faSeedling, faClipboardList, faClockRotateLeft, faFilePdf, faFlask, faSprayCan, faPlus, faEye, faBookOpen, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaseDetailsTab from "../investigation-tabs/case_details";
import InVitroTab from "../investigation-tabs/in_vitro";
import InVivoTab from "../investigation-tabs/in_vivo";
import InitialObservationTab from "../investigation-tabs/initial_observation";
import AddTreatmentModal from "@/components/modals/add_treatment_modal";
import { useAuth } from "@/hooks/useAuth";
import { useMoldReport, useMoldCase, useMoldCaseByReport, useMoldCaseLogs, useUser } from "@/hooks/swr";
import { apiMutate } from "@/lib/api";
import { useInvalidationFunctions } from '@/utils/cache-invalidation';
import PageLoading from "@/components/loading/page_loading";
import MessageBanner from "@/components/feedback/message_banner";

type Mycologist = {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
  id?: string;
};

function ViewCaseContent() {
  const searchParams = useSearchParams();
  const resourceId = searchParams.get('id') ?? undefined;
  const explicitEntityType = searchParams.get('entityType')?.toLowerCase().trim();
  const inferredEntityType = explicitEntityType
    ?? (resourceId?.toLowerCase().startsWith('case-')
      ? 'mold_case'
      : resourceId?.toLowerCase().startsWith('rep-') || resourceId?.toLowerCase().startsWith('report-')
        ? 'mold_report'
        : 'mold_report');
  const isCaseResource = inferredEntityType === 'mold_case';
  const { invalidateMoldReports } = useInvalidationFunctions();
  
  /*
   * The route receives `id` from notifications/activity links.
   * It can be either a report ID or a mold-case ID, so resolve both paths.
   */
  const { data: moldCaseByIdRes, isLoading: moldCaseByIdLoading } = useMoldCase(
    isCaseResource ? resourceId : undefined,
  );
  const reportId = isCaseResource
    ? moldCaseByIdRes?.data?.mold_report_id || resourceId
    : resourceId;

  /* ── SWR: mold report + mold case ── */
  const { data: reportRes, isLoading: reportLoading, mutate: mutateReport } = useMoldReport(reportId);
  const { data: moldCaseRes, isLoading: moldCaseByReportLoading, mutate: mutateMoldCase } = useMoldCaseByReport(
    isCaseResource ? undefined : reportId,
  );

  const caseData = reportRes?.data ?? null;
  const moldCase = moldCaseRes?.data ?? moldCaseByIdRes?.data ?? null;
  const canExportPdf = Boolean(reportId && ['resolved', 'closed'].includes(caseData?.status?.toLowerCase() || ''));
  const moldCaseId = moldCase?.id;
  const { data: logsRes, isLoading: logsLoading } = useMoldCaseLogs(moldCaseId, 200, !!moldCaseId);

  const handleExportPdf = useCallback(() => {
    if (!canExportPdf || !reportId) return;

    const printUrl = `/investigation/view-case/print?id=${encodeURIComponent(reportId)}`;
    window.location.assign(printUrl);
  }, [canExportPdf, reportId]);
  
  /* ── SWR: fetch mycologist by ID if assigned ── */
  const mycologistId = caseData?.assigned_mycologist_id;
  const { data: mycologistRes } = useUser(mycologistId);
  const mycologistData = mycologistRes?.data;
  
  // Resolve one canonical detail path at a time.
  // Case-originated routes load the case first and derive the report id; report-originated
  // routes go directly through the report and by-report case hooks.
  const loading =
    reportLoading ||
    (isCaseResource ? moldCaseByIdLoading : moldCaseByReportLoading) ||
    (!!moldCaseId && logsLoading);
  const error = !resourceId ? 'No case ID provided' : null;

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
    if (!pendingAssign || !reportId || !caseData) return;

    try {
      setAssignError(null);
      setIsAssigning(true);

      // Assigning a report auto-creates the mold case on backend.
      await apiMutate(`/api/v1/mold-reports/${reportId}/assign`, {
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
  }, [pendingAssign, reportId, caseData, mutateReport, mutateMoldCase]);

  const handleReject = useCallback(async () => {
    if (!reportId) return;

    try {
      const rejectionReason = window.prompt('Enter rejection reason:')?.trim();
      if (!rejectionReason) {
        alert('Rejection reason is required.');
        return;
      }

      await apiMutate(`/api/v1/mold-reports/${reportId}/reject`, {
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
  }, [reportId, mutateReport]);

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
  const caseName = caseData?.case_name || (loading ? "Loading..." : "N/A");
  const cropName = caseData?.host || (loading ? "Loading..." : "N/A");
  const location = caseData?.location || (loading ? "Loading..." : "N/A");
  const dateObserved = (() => {
    const d = toDate(caseData?.date_observed);
    return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (loading ? "Loading..." : "N/A");
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
  const reporterName = caseData?.reporter?.details?.displayName || (loading ? "Loading..." : "N/A");
  const reporterEmail = caseData?.reporter?.details?.email || "N/A";
  const reporterPhone = caseData?.reporter?.details?.phone_number || "N/A";
  const imageUrl = caseData?.reporter?.details?.photo_url || "/profile-placeholder.svg";

  const [imgSrc, setImgSrc] = useState(imageUrl);

  if (loading) {
    return <PageLoading message="Loading case..." fullScreen showTopBar />;
  }

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

  const finalVerdict = moldCase?.final_verdict;
  const finalVerdictMoldName = asText(finalVerdict?.moldName, finalVerdict?.moldId);
  const finalVerdictConfidence = confidenceText(finalVerdict?.confidence);
  const finalVerdictWikiMoldId = asText(finalVerdict?.moldipedia_id);
  const finalVerdictNotes = asText(finalVerdict?.mycologist_notes);
  const finalVerdictNotesHref = resourceId
    ? `/investigation/view-case/mycologist-notes?id=${encodeURIComponent(resourceId)}&entityType=${encodeURIComponent(inferredEntityType)}`
    : '';
  const finalVerdictTimestamp = (() => {
    const d = toDate(finalVerdict?.verdict_timestamp as string | { _seconds: number } | undefined);
    return d
      ? d.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '';
  })();
  const hasFinalVerdict = Boolean(
    finalVerdictMoldName ||
      finalVerdictConfidence ||
      finalVerdictWikiMoldId ||
      finalVerdictNotes ||
      finalVerdictTimestamp,
  );
  const finalVerdictWikiMoldHref = finalVerdictWikiMoldId
    ? `/wikimold/view-wikimold/${encodeURIComponent(finalVerdictWikiMoldId)}`
    : '';

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
        cultureName: asText(
          characteristics?.culture_name,
          characteristics?.cultureName,
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
        cultureName: asText(
          characteristics?.culture_name,
          characteristics?.cultureName,
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
    const macroSigns = asTextList(
      initialObs?.initial_signs ??
      cultivationDetails?.initial_signs ??
      initialLogCharacteristics?.signs ??
      initialLogCharacteristics?.signsDisplay ??
      initialLogCharacteristics?.symptoms_signs ??
      initialLogCharacteristics?.symptomsSigns,
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
        macroSigns={macroSigns}
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
      label: "Initial Diagnosis",
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 w-full">
  
  {/* LEFT COLUMN: Sidebar */}
  <aside className="xl:col-span-4 space-y-6">
    {/* Farmer Profile Card - Solid & Tonal */}
    <div className="bg-[var(--background-color)] rounded-[2.5rem] p-10 border-2 border-[var(--primary-color)]/10 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative mb-6">
          <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-8 border-[var(--primary-color)]/5 shadow-xl transition-transform group-hover:rotate-2 duration-500">
            <Image
              key={imgSrc}
              src={imgSrc}
              alt="Profile"
              fill
              className="object-cover"
              onError={() => setImgSrc("/assets/default-fallback.png")}
            />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tight">{reporterName}</h2>
        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          {(caseData?.reporter as any)?.occupation || "Farmer"}
        </span>
        <div className="w-full h-px bg-[var(--primary-color)]/10 my-8" />
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold opacity-30 text-[10px] uppercase tracking-widest font-[family-name:var(--font-montserrat)]">Email</span>
            <span className="font-black text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">{reporterEmail}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold opacity-30 text-[10px] uppercase tracking-widest font-[family-name:var(--font-montserrat)]">Contact Number</span>
            <span className="font-black text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">{reporterPhone}</span>
          </div>
        </div>
      </div>
    </div>

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

  {/* RIGHT COLUMN: Main Content */}
  <section className="xl:col-span-8 space-y-6">
    
    <div className="relative overflow-hidden rounded-[3.5rem] bg-[var(--primary-color)] p-12 shadow-2xl shadow-[var(--primary-color)]/20">
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--background-color) 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--background-color)]/10 border border-[var(--background-color)]/20">
            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: getStatusColor(status) }} />
            <span className="font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-[0.3em] text-[var(--background-color)]">{status}</span>
          </div>

          <button 
            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all font-[family-name:var(--font-bricolage-grotesque)] ${
              canExportPdf
                ? 'bg-[var(--background-color)] text-[var(--primary-color)] hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-[var(--background-color)]/10 text-[var(--background-color)]/40 cursor-not-allowed border border-[var(--background-color)]/20'
            }`}
            onClick={handleExportPdf}
            disabled={!canExportPdf}
            title={canExportPdf ? 'Open printable preview' : 'PDF export is only available for resolved or closed cases'}
          >
            <FontAwesomeIcon icon={faFilePdf} /> Export PDF
          </button>
        </div>

        <h2 className="text-5xl md:text-6xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter leading-[0.85] mb-16 text-[var(--background-color)]">
          {caseName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-[var(--background-color)]/20">
          <div className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--background-color)] opacity-40 font-[family-name:var(--font-bricolage-grotesque)]">Host Plant Affected</span>
            <p className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[var(--background-color)]">{cropName}</p>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--background-color)] opacity-40 font-[family-name:var(--font-bricolage-grotesque)]">Address</span>
            <p className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[var(--background-color)]">{location}</p>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--background-color)] opacity-40 font-[family-name:var(--font-bricolage-grotesque)]">Date First Observed</span>
            <p className="text-2xl font-bold font-[family-name:var(--font-montserrat)] text-[var(--background-color)]">{dateObserved}</p>
          </div>
        </div>
      </div>
    </div>

    {/* VERDICT BOX */}
    {hasFinalVerdict && (
        <div className="rounded-[3rem] border-2 border-[var(--primary-color)]/10 bg-[var(--background-color)] p-10 shadow-sm relative overflow-hidden">
          
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-color)] flex items-center justify-center text-[var(--background-color)] shadow-lg shadow-[var(--primary-color)]/10">
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">Findings & Remarks</p>
                <h3 className="text-3xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tight">
                  {finalVerdictMoldName || 'Pending'}
                </h3>
              </div>
            </div>
            
            {finalVerdictConfidence && (
              <div className="px-5 py-2.5 rounded-2xl bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/5 text-right">
                <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--primary-color)] opacity-40">Confidence Level</span>
                <span className="text-lg font-black text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">{finalVerdictConfidence}</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[var(--primary-color)]/[0.03] rounded-2xl p-6 border border-[var(--primary-color)]/5 flex justify-between items-center group">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black uppercase text-[var(--moldify-grey)] opacity-50">Reference Article</span>
              {finalVerdictWikiMoldHref && (
                <Link 
                  href={finalVerdictWikiMoldHref} 
                  className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black text-[var(--primary-color)] uppercase hover:opacity-80 transition-all flex items-center gap-2"
                >
                  View related WikiMold article <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                </Link>
              )}
            </div>
            <div className="bg-[var(--primary-color)]/[0.03] rounded-2xl p-6 border border-[var(--primary-color)]/5">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black uppercase text-[var(--moldify-grey)] opacity-50 block mb-1">Last Sync</span>
              <p className="font-[family-name:var(--font-montserrat)] text-sm font-bold text-[var(--primary-color)] uppercase tracking-tighter">{finalVerdictTimestamp || 'Awaiting Data'}</p>
            </div>
          </div>

          {finalVerdictNotes && (
            <div className="bg-[var(--primary-color)]/[0.03] rounded-3xl p-8 border border-[var(--primary-color)]/5">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="max-w-sm">
                  <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent-color)] mb-2">
                    Mycologist Remarks Overview
                  </p>
                  <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xs leading-relaxed text-[var(--moldify-grey)] font-medium italic">
                    Detailed mycologist notes are available in the dedicated reading view. Use it to review the full message without crowding the case summary.
                  </p>
                </div>
                {finalVerdictNotesHref && (
                  <Link 
                    href={finalVerdictNotesHref} 
                    className="font-[family-name:var(--font-bricolage-grotesque)] px-10 py-4 bg-[var(--primary-color)] text-[var(--background-color)] rounded-xl font-black text-xs uppercase shadow-md hover:translate-x-1 transition-all"
                  >
                    View Mycologist Notes
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

        {/* DATA TABS */}
        <div className="bg-[var(--background-color)] rounded-[3rem] p-10 border-2 border-[var(--primary-color)]/5">
          <TabBar tabs={tabs} initialIndex={0} />
        </div>
      </section>
    </div>
      )}

      {/* Error Alert */}
      {assignError && (
        <MessageBanner variant="error" className="fixed top-4 right-4 max-w-md z-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-[family-name:var(--font-montserrat)] font-bold">Assignment Failed</div>
              <div className="font-[family-name:var(--font-bricolage-grotesque)] text-sm mt-1">{assignError}</div>
            </div>
            <button onClick={() => setAssignError(null)} className="font-black">✕</button>
          </div>
        </MessageBanner>
      )}

      {/* Modals */}
      <AssignCaseModal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        caseId={reportId}
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
    <Suspense fallback={<PageLoading fullScreen showTopBar />}>
      <ViewCaseContent />
    </Suspense>
  );
}