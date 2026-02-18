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
  const assignedMycologistName = moldCase?.mycologist_name || caseData?.assigned_mycologist?.details?.displayName || null;

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
            <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5 shadow-[0_20px_50px_-25px_rgba(62,92,10,0.05)]">
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

            {/* Assignment Status Sticky Note style */}
            {(userRole !== "Mycologist" || isAssigned || isRejected) && (
               <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5 shadow-[0_20px_50px_-25px_rgba(62,92,10,0.05)]">
                  <p className="text-xs font-black uppercase text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">Filing Status</p>
                  {(isAssigned || isRejected) ? (
                    <p className="font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                      {isRejected ? "FILE CLOSED / REJECTED" : `MYCOLOGIST: ${assignedMycologistName?.toUpperCase()}`}
                    </p>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[var(--primary-color)]">Review Action:</span>
                      <select
                        className="bg-[var(--primary-color)] w-full text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer outline-none hover:brightness-110 transition-all"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value === "assign") setAssignModalOpen(true);
                          if (e.target.value === "reject") setRejectModalOpen(true);
                        }}
                      >
                        <option value="" disabled>Select Action</option>
                        <option value="assign">Approve & Assign</option>
                        <option value="reject">Reject Case</option>
                      </select>
                    </div>
                  )}
               </div>
            )}
          </aside>

          {/* RIGHT COLUMN: Case Core Data */}
          <section className="xl:col-span-8 space-y-4">
  
          {/* MINIMALIST STATUS LINE - No boxes, just clean typography on the cream bg */}
          <div className="font-[family-name:var(--font-montserrat)] flex items-center gap-6 px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'Pending' ? 'bg-amber-500' : 'bg-green-600'}`} />
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
          <div className="bg-[var(--primary-color)] text-[var(--background-color)] rounded-[2.5rem] p-12 relative shadow-[0_20px_50px_-25px_rgba(62,92,10,0.05)] overflow-hidden">
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

            {/* 4. MODERN UTILITY BAR */}
            <div className="flex flex-wrap gap-3 bg-[var(--taupe)]/30 p-2 rounded-2xl border border-[var(--primary-color)]/5">
              {userRole !== "Administrator" && (
                <button 
                  className="font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase bg-white text-[var(--primary-color)] px-4 py-4 rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm group cursor-pointer"
                  onClick={() => setAddTreatmentOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="group-hover:scale-125 transition-transform" /> Add Treatment
                </button>
              )}
              <button className="font-[family-name:var(--font-bricolage-grotesque)] flex-1 min-w-[150px] flex items-center justify-center gap-2 text-xs font-black uppercase bg-white text-[var(--primary-color)] px-4 py-4 rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm cursor-pointer">
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
            <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5 shadow-[0_20px_50px_-25px_rgba(62,92,10,0.05)]">
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