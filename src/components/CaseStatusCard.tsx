"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StatusDropdown from "./StatusDropdown";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function CaseStatusCard({
  userRole, isAssigned, isRejected, isApproved, assignedMycologistName, assignedMycologistOccupation, caseData, status,
  setAssignModalOpen, setRejectModalOpen
}: any) {
  const isAdmin = userRole === "Administrator" || userRole === "admin";

  if (!isAdmin) return null;

  const getTheme = () => {
    if (isRejected) return {
      border: "border-[var(--moldify-red)]/20",
      badge: "bg-[var(--moldify-red)] text-white",
      text: "text-[var(--moldify-red)]",
      label: "REJECTED",
      sublabel: "Filing Status"
    };
    if (isApproved) return {
      border: "border-[var(--primary-color)]/20",
      badge: "bg-[var(--primary-color)] text-white",
      text: "text-[var(--primary-color)]",
      label: "APPROVED",
      sublabel: "Filing Status"
    };
    if (isAssigned) return {
      border: "border-[var(--primary-color)]/20",
      badge: "bg-[var(--primary-color)] text-white",
      text: "text-[var(--primary-color)]",
      label: "ASSIGNED",
      sublabel: "Assigned To"
    };
    return {
      border: "border-[var(--primary-color)]/5",
      badge: "bg-[var(--accent-color)] text-white",
      text: "text-[var(--moldify-black)]",
      label: "UNASSIGNED",
      sublabel: "Filing Status"
    };
  };

  const theme = getTheme();

  return (
    <div className="bg-[var(--background-color)] rounded-3xl p-8 border-3 border-[var(--primary-color)]/5 shadow-[0_20px_50px_-25px_rgba(62,92,10,0.05)]">
      
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
              {theme.sublabel}
            </p>
            <h2 className={`font-[family-name:var(--font-montserrat)] text-2xl font-black uppercase tracking-tight leading-none ${theme.text}`}>
              {isRejected
                ? "Rejected"
                : isAssigned
                  ? (assignedMycologistName || "Specialist Assigned")
                  : "Pending Review"}
            </h2>
            {isAssigned && assignedMycologistOccupation && (
              <p className="text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] opacity-70">
                {assignedMycologistOccupation}
              </p>
            )}
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${theme.badge} shadow-sm`}>
            {theme.label}
          </div>
        </div>

        {/* Action Section: Initial Assignment (Unassigned & Pending) */}
        {!isAssigned && !isRejected && caseData?.status?.toLowerCase() === 'pending' && (
          <div className="pt-8 border-t border-black/[0.04]">
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                Choose Action
              </p>
              <div className="w-full sm:w-auto min-w-[250px]">
                <StatusDropdown 
                  placeholder="Take Action"
                  options={[
                    { label: "Approve & Assign", value: "assign" },
                    { label: "Reject Case", value: "reject", variant: "danger" }
                  ]}
                  onSelect={(val: string) => val === "assign" ? setAssignModalOpen(true) : setRejectModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reassignment Section: Shows if Already Assigned */}
        {isAdmin && isAssigned && !isRejected && (
          <div className="pt-10 border-t-2 border-[var(--primary-color)]/5">
            
            <div className="flex flex-col items-start gap-6">
              
              <div className="flex gap-5">
                <div className="w-[4px] h-12 rounded-full bg-[var(--accent-color)] shadow-[0_0_15px_rgba(var(--accent-color),0.3)]" />
                
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-black text-[var(--primary-color)] uppercase tracking-[0.15em] font-[family-name:var(--font-bricolage-grotesque)] leading-none mb-1.5">
                    Management Protocol
                  </p>
                  <p className="text-[14px] font-bold text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] leading-snug">
                    Update the specialist assigned to this case record.
                  </p>
                </div>
              </div>

              {/* 2. Action Button */}
              <button
                onClick={() => setAssignModalOpen(true)}
                className="cursor-pointer group relative flex items-center gap-4 px-10 py-4 bg-[var(--primary-color)] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--primary-color)]/10"
              >
                <span className="text-[12px] font-black text-white uppercase tracking-[0.1em] font-[family-name:var(--font-bricolage-grotesque)]">
                  Reassign Mycologist
                </span>
                
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  className="text-white text-xs opacity-60 group-hover:translate-x-1 transition-transform" 
                />
                
                {/* Subtle hover shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}