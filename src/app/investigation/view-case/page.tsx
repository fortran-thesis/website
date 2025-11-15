"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import TabBar from "@/components/tab_bar";
import StatusBox from "@/components/tiles/status_tile";
import AssignCaseModal from "@/components/modals/assign_case_modal";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { faSeedling, faClipboardList, faClockRotateLeft, faFilePdf, faFlask, faSprayCan, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaseDetailsTab from "../investigation-tabs/case_details";
import InVitroTab from "../investigation-tabs/in_vitro";
import InVivoTab from "../investigation-tabs/in_vivo";
import AddTreatmentModal from "@/components/modals/add_treatment_modal";

type Mycologist = {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
  id?: string;
};

export default function ViewCase({ src }: { src?: string }) {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('id');
  
  const [caseData, setCaseData] = useState<any>(null);
  const [moldCase, setMoldCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isConfirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [isAddTreatmentOpen, setAddTreatmentOpen] = useState(false);

  const [pendingAssign, setPendingAssign] = useState<{ mycologist: Mycologist; priority: string; endDate: Date | null } | null>(null);

  // Fetch case data by ID
  useEffect(() => {
    if (!caseId) {
      setError('No case ID provided');
      setLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/v1/mold-reports/${caseId}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load case details');
        }
        const body = await res.json();

        console.log("Fetched case data:", body.data);

        if (body.success && body.data) {
          setCaseData(body.data);
          console.log("Full case data:", body.data); // Log the entire case data
          console.log("Priority from case data:", body.data.priority); // Log the priority specifically

          // If case has assigned mycologist, fetch the mold-case
          if (body.data.assigned_mycologist_id) {
            try {
              const moldCaseRes = await fetch(`/api/v1/mold-cases/by-report/${caseId}`, { cache: 'no-store' });
              if (moldCaseRes.ok) {
                const moldCaseBody = await moldCaseRes.json();
                if (moldCaseBody.success && moldCaseBody.data) {
                  setMoldCase(moldCaseBody.data);
                }
              }
            } catch (err: any) {
              console.error('Failed to fetch mold-case:', err);
            }
          }
        } else {
          throw new Error(body.error || 'Failed to load case');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId]);

  // Called from AssignCaseModal -> opens confirmation modal
  const handleAssignClick = (mycologist: Mycologist, priority: string, endDate: Date | null) => {
    console.log("🔍 Page - Received priority:", priority);
    console.log("🔍 Page - Received mycologist:", mycologist);
    console.log("🔍 Page - Received endDate:", endDate);
    setPendingAssign({ mycologist, priority, endDate });
    setConfirmAssignOpen(true);
  };

  // Called from confirmation modal -> finalize assignment
  const handleConfirmAssign = async () => {
    if (!pendingAssign || !caseId || !caseData) return;

    try {
      // Step 1: PATCH to assign mycologist to the mold-report
      const assignRes = await fetch(`/api/v1/mold-reports/${caseId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_mycologist_id: pendingAssign.mycologist.id,
        }),
      });

      if (!assignRes.ok) {
        throw new Error('Failed to assign mycologist');
      }

      // Step 2: POST to create a mold-case
      const moldCasePayload = {
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
      };

      const caseRes = await fetch('/api/v1/mold-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moldCasePayload),
      });

      if (!caseRes.ok) {
        throw new Error('Failed to create mold case');
      }

      console.log("Assignment complete:", pendingAssign.mycologist, pendingAssign.priority, pendingAssign.endDate);
      setPendingAssign(null);
      setConfirmAssignOpen(false);
      setAssignModalOpen(false);

      // Refresh case data to update UI
      const refreshRes = await fetch(`/api/v1/mold-reports/${caseId}`, { cache: 'no-store' });
      if (refreshRes.ok) {
        const body = await refreshRes.json();
        if (body.success && body.data) {
          setCaseData(body.data);
        }
      }
    } catch (err: any) {
      console.error('Assignment failed:', err);
      alert(err?.message || 'Failed to assign case');
    }
  };

  const handleReject = async () => {
    if (!caseId) return;

    try {
      const rejectRes = await fetch(`/api/v1/mold-reports/${caseId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!rejectRes.ok) {
        throw new Error('Failed to reject case');
      }

      console.log("Case rejected!");
      setRejectModalOpen(false);

      // Refresh case data to update UI
      const refreshRes = await fetch(`/api/v1/mold-reports/${caseId}`, { cache: 'no-store' });
      if (refreshRes.ok) {
        const body = await refreshRes.json();
        if (body.success && body.data) {
          setCaseData(body.data);
        }
      }
    } catch (err: any) {
      console.error('Rejection failed:', err);
      alert(err?.message || 'Failed to reject case');
    }
  };

  type UserRole = "Administrator" | "Mycologist";

  const [userRole] = useState<UserRole>("Administrator");
  
  // Use data from API
  const caseName = caseData?.case_name || "Loading...";
  const cropName = caseData?.host || "Loading...";
  const location = caseData?.location || "Loading...";
  const dateObserved = caseData?.date_observed 
    ? new Date(caseData.date_observed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "Loading...";
  const status = caseData?.status ? caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1) : "Pending";
  const priority = caseData?.priority || "------";
  
  // Reporter info
  const reporterName = caseData?.reporter?.details.displayName || "Loading...";
  const reporterEmail = caseData?.reporter?.details.email || "N/A";
  const reporterPhone = caseData?.reporter?.details.phone_number || "N/A";
  const imageUrl = caseData?.reporter?.details.photo_url || "/profile-placeholder.png";

  // IMPORTANT: Derive state from backend data, not local state
  const isAssigned = !!caseData?.assigned_mycologist_id;
  const isRejected = caseData?.status === 'closed';
  const assignedMycologistName = caseData?.assigned_mycologist?.details?.displayName || null;

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
  const getInVitroContent = () => {
    if (!isAssigned) {
      return (
        <InVitroTab
          dateTime=""
          growthMedium=""
          incubationTemperature=""
          inVitroEntries={[]}
          emptyMessage="No mycologist assigned to this case yet"
        />
      );
    }
    
    if (!moldCase || !moldCase.cultivation_logs || moldCase.cultivation_logs.length === 0) {
      return (
        <InVitroTab
          dateTime=""
          growthMedium={moldCase?.cultivation_details?.in_vitro_details?.growthMedium || ""}
          incubationTemperature={moldCase?.cultivation_details?.in_vitro_details?.incubationTemperature || ""}
          inVitroEntries={[]}
          emptyMessage="Mycologist assigned. No cultivation activity recorded yet."
        />
      );
    }
    
    const vitroLogs = moldCase.cultivation_logs.filter((log: any) => log.type === "vitro");
    const vitroEntries = vitroLogs.map((log: any) => ({
      date: log.created_at ? new Date(log.created_at).toLocaleString() : "",
      imagePath: log.image_urls?.[0] || "/images/placeholder.jpg",
      sizeValue: log.characteristics?.size || "N/A",
      colorValue: log.characteristics?.color || "N/A",
      notes: log.additional_info || "",
    }));
    
    return (
      <InVitroTab
        dateTime={moldCase.start_date ? `Started: ${new Date(moldCase.start_date).toLocaleString()}` : ""}
        growthMedium={moldCase.cultivation_details?.in_vitro_details?.growthMedium || ""}
        incubationTemperature={moldCase.cultivation_details?.in_vitro_details?.incubationTemperature || ""}
        inVitroEntries={vitroEntries}
      />
    );
  };

  // In vivo content
  const getInVivoContent = () => {
    if (!isAssigned) {
      return (
        <InVivoTab
          dateTime=""
          environmentalTemperature=""
          inVivoEntries={[]}
          emptyMessage="No mycologist assigned to this case yet"
        />
      );
    }
    
    if (!moldCase || !moldCase.cultivation_logs || moldCase.cultivation_logs.length === 0) {
      return (
        <InVivoTab
          dateTime=""
          environmentalTemperature={moldCase?.cultivation_details?.in_vivo_details?.environmentalTemperature || ""}
          inVivoEntries={[]}
          emptyMessage="Mycologist assigned. No cultivation activity recorded yet."
        />
      );
    }
    
    const vivoLogs = moldCase.cultivation_logs.filter((log: any) => log.type === "vivo");
    const vivoEntries = vivoLogs.map((log: any) => ({
      date: log.created_at ? new Date(log.created_at).toLocaleString() : "",
      imagePath: log.image_urls?.[0] || "/images/placeholder.jpg",
      sizeValue: log.characteristics?.size || "N/A",
      colorValue: log.characteristics?.color || "N/A",
      notes: log.additional_info || "",
    }));
    
    return (
      <InVivoTab
        dateTime={moldCase.start_date ? `Started: ${new Date(moldCase.start_date).toLocaleString()}` : ""}
        environmentalTemperature={moldCase.cultivation_details?.in_vivo_details?.environmentalTemperature || ""}
        inVivoEntries={vivoEntries}
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
  
  const [imgSrc, setImgSrc] = useState(src || imageUrl);

  return (
    <div className="flex flex-col min-h-screen xl:py-2 py-10">
      {/* Header */}
      <header className="w-full bg-[var(--background-color)] z-10 mb-5">
        <Breadcrumbs role={userRole} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
          INVESTIGATION OVERSIGHT
        </h1>
      </header>

      <BackButton />

      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">Loading case details...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600 font-[family-name:var(--font-bricolage-grotesque)]">{error}</p>
        </div>
      )}

      {!loading && !error && caseData && (
      <div className="flex flex-col lg:flex-row flex-1 mt-2 gap-6">

        <aside className="lg:sticky lg:top-10 lg:self-start w-full lg:w-1/3 bg-transparent rounded-xl">
          {/* Show dropdown only if not assigned and not rejected */}
          {userRole !== "Mycologist" && !isAssigned && !isRejected && (
            <select
              aria-label="action-options"
              id="action"
              className="bg-[var(--taupe)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold p-4 rounded-lg cursor-pointer focus:outline-none w-full"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value === "assign") setAssignModalOpen(true);
                if (e.target.value === "reject") setRejectModalOpen(true);
              }}
            >
              <option value="" disabled>Choose Action</option>
              <option value="assign">Assign Case</option>
              <option value="reject">Reject Case</option>
            </select>
          )}

          {/* Show assigned message if assigned */}
          {isAssigned && assignedMycologistName && (
            <p className="p-4 rounded-lg bg-[var(--taupe)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] text-sm font-semibold">
              Assigned to: {assignedMycologistName}
            </p>
          )}

          {/* Show rejected message if rejected */}
          {isRejected && (
            <p className="p-4 rounded-lg bg-red-100 border border-red-400 font-[family-name:var(--font-bricolage-grotesque)] text-red-700 text-sm font-semibold">
              This case has been rejected
            </p>
          )}

          {/* Farmer Info */}
          <div className="w-full min-h-screen p-6 bg-[var(--taupe)] mt-2 rounded-lg flex flex-col justify-start">
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] items-start font-extrabold">
              Farmer Information
            </p>
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-50 h-50 rounded-full overflow-hidden shadow-sm">
                <Image
                  key={imgSrc}
                  src={imgSrc}
                  alt="Profile Picture"
                  fill
                  className="object-cover rounded-full"
                  onError={() => setImgSrc("/assets/default-fallback.png")}
                  priority
                />
              </div>
              <div className="flex flex-col mt-4 items-center justify-center">
                <h1 className="font-[family-name:var(--font-montserrat)] text-lg font-black text-[var(--primary-color)]">{reporterName}</h1>
                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Email Address:</p>
                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{reporterEmail}</p>
                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Phone Number:</p>
                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{reporterPhone}</p>
              </div>
            </div>
            <hr className="my-8 border-t border-[var(--moldify-grey)]" />

            <div className="flex flex-col gap-2">
             {userRole !== "Administrator" && (
                <button 
                  className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
                  onClick={() => setAddTreatmentOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-[var(--accent-color)]" /> Add Treatment
                </button>
              )}
              <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer">
                <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-[var(--accent-color)]" /> Export PDF
              </button>
                <button
                className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
                onClick={() => (window.location.href = "/investigation/identification-history")}
                >
                <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4 text-[var(--accent-color)]" /> View Identification History
                </button>
              <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
              onClick={() => (window.location.href = "/investigation/treatment-history")}
              >
                <FontAwesomeIcon icon={faSprayCan} className="w-4 h-4 text-[var(--accent-color)]" /> View Treatment History
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-2 mt-2 lg:mt-0">
          <div className="flex items-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] mr-5">{caseName}</h1>
            <div className="flex gap-2">
              <StatusBox status={status} />
              {priority !== "------" && <StatusBox status={priority} />}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 mb-10">
            <div className="flex flex-col">
              <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Crop Name:</p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{cropName}</h2>
            </div>
            <div className="flex flex-col">
              <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Location:</p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{location}</h2>
            </div>
            <div className="flex flex-col">
              <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Date First Observed:</p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{dateObserved}</h2>
            </div>
          </div>

          <TabBar tabs={tabs} initialIndex={0} />
        </main>
      </div>
      )}

      {/* Modals */}
      <AssignCaseModal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
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
    </div>
  );
}