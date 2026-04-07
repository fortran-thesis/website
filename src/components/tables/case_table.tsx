"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSeedling, faEye } from "@fortawesome/free-solid-svg-icons";
import StatusBox from "../tiles/status_tile";
import EmptyState from "../empty_state";
import TopLoadingBar from "@/components/loading/top_loading_bar";

interface CaseData {
  caseName: string;
  cropName: string;
  location: string;
  submittedBy: string;
  dateSubmitted: string;
  status: string;
}

interface CaseTableProps {
  cases: CaseData[];
  onEdit?: (caseItem: CaseData) => void;
  showStatus?: boolean;
  showAction?: boolean;
  useViewIcon?: boolean;
}

export default function CaseTable({
  cases,
  onEdit,
  showStatus = true,
  showAction = true,
  useViewIcon = false,
}: CaseTableProps) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleEditClick = (caseItem: CaseData) => {
    setNavigatingId(caseItem.caseName);
    onEdit?.(caseItem);
  };

  return (
    <>
      {/* Top Loading Bar */}
      <TopLoadingBar isVisible={Boolean(navigatingId)} />

      <div className="min-w-full overflow-x-auto mt-4 rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        <div className="h-[600px] overflow-y-auto">
        {cases.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={faSeedling}
              title="No Cases Found"
              message="No mold cases available. Submit a new case to get started."
            />
          </div>
        ) : (
        <table className="min-w-full table-fixed text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
          <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
            <tr>
              <th className="py-3 px-4 rounded-tl-xl">Case Name</th>
              <th className="py-3 px-4">Crop Name</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Submitted By</th>
              <th className="py-3 px-4">Date Submitted</th>
              {showStatus && <th className="py-3 px-4">Status</th>}
              {showAction && <th className="py-3 px-4 rounded-tr-xl text-center">Action</th>}
            </tr>
          </thead>

          <tbody className="bg-[var(--background-color)]">
            {cases.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[var(--taupe)] hover:bg-[var(--accent-color)]/10 transition text-center"
              >
                <td className="py-3 px-4 truncate max-w-[150px]">{item.caseName}</td>
                <td className="py-3 px-4 truncate max-w-[120px]">{item.cropName}</td>
                <td className="py-3 px-4 truncate max-w-[160px]">{item.location}</td>
                <td className="py-3 px-4 truncate max-w-[140px]">{item.submittedBy}</td>
                <td className="py-3 px-4 truncate max-w-[140px]">{item.dateSubmitted}</td>
                {showStatus && (
                  <td className="py-3 px-4">
                    <StatusBox status={item.status} fontSize="0.75rem" />
                  </td>
                )}
                {showAction && (
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEditClick(item)}
                      disabled={navigatingId === item.caseName}
                      className={`text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)] ${
                        navigatingId === item.caseName ? 'opacity-60 cursor-wait' : ''
                      }`}
                      aria-label={useViewIcon ? "View" : "Edit"}
                      title={useViewIcon ? "View Case" : "Edit Case"}
                    >
                      <FontAwesomeIcon 
                        icon={faEye} 
                        className={navigatingId === item.caseName ? 'animate-pulse' : ''}
                        style={{ width: "12px", height: "12px" }} 
                      />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
    </>
  );
}
