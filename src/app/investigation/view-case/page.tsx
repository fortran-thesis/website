"use client";

import { useState, useEffect, Suspense } from "react";
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
import { useAuth } from "@/hooks/useAuth";

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
          console.log("Mold case from report:", body.data.mold_case);
          console.log("Priority from report mold_case:", body.data.mold_case?.priority);

          // Always attempt to fetch the mold-case so priority can be shown
          try {
            const moldCaseRes = await fetch(`/api/v1/mold-cases/by-report/${caseId}`, { cache: 'no-store' });
            if (moldCaseRes.ok) {
              const moldCaseBody = await moldCaseRes.json();
              if (moldCaseBody.success && moldCaseBody.data) {
                setMoldCase(moldCaseBody.data);
              } else {
                setMoldCase(null);
              }
            } else {
              setMoldCase(null);
            }
          } catch (err: any) {
            setMoldCase(null);
            console.error('Failed to fetch mold-case:', err);
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
  const { user: authUser } = useAuth();

  const rawRole = (authUser?.user?.role || authUser?.role || "").toLowerCase();
  const userRole: UserRole = rawRole === "mycologist" ? "Mycologist" : "Administrator";
  
  // Use data from API
  const caseName = caseData?.case_name || "Loading...";
  const cropName = caseData?.host || "Loading...";
  const location = caseData?.location || "Loading...";
  const dateObserved = caseData?.date_observed 
    ? new Date(caseData.date_observed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "Loading...";
  const status = caseData?.status ? caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1) : "Pending";
  const priorityValue = caseData?.mold_case?.priority || caseData?.priority || moldCase?.priority || priorityFromQuery || "";
  const priority = priorityValue
    ? priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1)
    : "Unknown";
  
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
  
  const [imgSrc, setImgSrc] = useState(imageUrl);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background-color)] w-full">


  {/* 1. TOP HEADER */}
  <header className="mb-8">
    <div>
      <Breadcrumbs role={userRole} />
      <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-4xl uppercase tracking-tighter mt-2">
        Case Management
      </h1>
    </div>
  </header>

  <div className="mb-4">
    <BackButton />  
  </div>
  {!loading && !error && caseData && (
    <div className="flex flex-col gap-4">
      {/* 2. THE MANAGEMENT BAR (Farmer + Actions) */}
       <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Farmer Profile Card */}
        <div className="lg:col-span-2 bg-[var(--taupe)]  rounded-2xl p-6 flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
            <Image
              key={imgSrc}
              src={imgSrc}
              alt="Profile"
              fill
              className="object-cover"
              onError={() => setImgSrc("/assets/default-fallback.png")}
            />
          </div>
          <div className="flex-1">
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] text-[10px] font-black uppercase tracking-widest mb-1">Farmer Information</p>
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] uppercase">{reporterName}</h2>
            <div className="flex flex-wrap gap-x-6 mt-2">
              <p className="text-sm font-bold font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
                <span className="font-[family-name:var(--font-bricolage-grotesque)] font-normal mr-2">Email:</span>{reporterEmail}
              </p>
              <p className="text-sm font-bold font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
                <span className="font-[family-name:var(--font-bricolage-grotesque)] font-normal  mr-2">Phone:</span>{reporterPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Decision Card */}
        <div className="bg-[var(--taupe)] rounded-2xl p-6 flex flex-col justify-center">
          {userRole !== "Mycologist" && !isAssigned && !isRejected && (
            <>
              <p className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-black uppercase tracking-widest mb-3 text-center">Case Status Action</p>
              <select
                className="bg-[var(--taupe)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-black p-3 rounded-lg w-full cursor-pointer outline-none"
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
            </>
          )}
          {(isAssigned || isRejected) && (
             <div className="text-center">
                <p className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest">
                  {isRejected ? "Status: Rejected" : `Assigned: ${assignedMycologistName}`}
                </p>
             </div>
          )}
        </div>
      </section>

      {/* 3. THE CASE DETAILS HERO */}
      <section className="bg-[var(--taupe)] rounded-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[220px]">
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] uppercase tracking-tight">
              {caseName}
            </h2>
            </div>
            <div className="flex gap-2">
              <StatusBox status={status} />
              <StatusBox status={priority} />
            </div>
          </div>
          <div className="mt-3 h-[2px] w-full bg-[var(--primary-color)]/20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[var(--primary-color)]/10 bg-[var(--taupe)] p-6">
          <div className="pb-4 md:pb-0 md:px-4 flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase opacity-50 font-[family-name:var(--font-bricolage-grotesque)]">Crop Type</span>
            <p className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">{cropName}</p>
          </div>
          <div className="py-4 md:py-0 md:px-4 flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase opacity-50 font-[family-name:var(--font-bricolage-grotesque)]">Location</span>
            <p className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">{location}</p>
          </div>
          <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase opacity-50 font-[family-name:var(--font-bricolage-grotesque)]">Observed On</span>
            <p className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">{dateObserved}</p>
          </div>
        </div>
      </section>

      {/* 4. UTILITY TOOLBAR (The 3 Buttons) */}
      <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
        {userRole !== "Administrator" && (
          <button 
            className="flex items-center gap-2 text-xs font-black uppercase font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] px-6 py-3 rounded-full hover:brightness-110 transition-all cursor-pointer"
            onClick={() => setAddTreatmentOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Treatment
          </button>
        )}
        <button className="flex items-center gap-2 text-xs font-black uppercase font-[family-name:var(--font-bricolage-grotesque)] text-[var(--background-color)] px-6 py-3 rounded-full bg-[var(--primary-color)] hover:brightness-110 transition-all cursor-pointer">
          <FontAwesomeIcon icon={faFilePdf} /> Export PDF
        </button>
        <button 
          className="flex items-center gap-2 text-xs font-black uppercase font-[family-name:var(--font-bricolage-grotesque)] text-[var(--background-color)] px-6 py-3 rounded-full bg-[var(--primary-color)] hover:brightness-110 transition-all cursor-pointer"
          onClick={() => (window.location.href = "/investigation/identification-history")}
        >
          <FontAwesomeIcon icon={faClockRotateLeft} /> Identification History
        </button>
        <button 
          className="flex items-center gap-2 text-xs font-black uppercase font-[family-name:var(--font-bricolage-grotesque)] text-[var(--background-color)] px-6 py-3 rounded-full bg-[var(--primary-color)] hover:brightness-110 transition-all cursor-pointer"
          onClick={() => (window.location.href = "/investigation/treatment-history")}
        >
          <FontAwesomeIcon icon={faSprayCan} /> Treatment History
        </button>
      </div>

      {/* 5. MAIN DATA TABS */}
      <div className="mt-4">
        <TabBar tabs={tabs} initialIndex={0} />
      </div>
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

export default function ViewCase() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewCaseContent />
    </Suspense>
  );
}