"use client";
import StatusDropdown from "./StatusDropdown";

export default function CaseStatusCard({
  userRole, isAssigned, isRejected, isApproved, assignedMycologistName, assignedMycologistOccupation, caseData, status,
  setAssignModalOpen, setRejectModalOpen
}: any) {
  
  if (userRole === "Mycologist" && !isAssigned && !isRejected && !isApproved) return null;

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
        {isAssigned && !isRejected && (
          <div className="pt-8 border-t border-black/[0.04]">
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                Manage Assignment
              </p>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="w-full sm:w-auto min-w-[250px] px-4 py-3 bg-[var(--primary-color)] text-white font-[family-name:var(--font-bricolage-grotesque)] text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Reassign Mycologist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}