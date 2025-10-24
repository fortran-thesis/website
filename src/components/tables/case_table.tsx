"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import StatusBox from "../tiles/status_tile";

interface CaseData {
  caseName: string;
  cropName: string;
  submittedBy: string;
  location: string;
  priority: string;
  status: string;
}

interface CaseTableProps {
  cases: CaseData[];
  onEdit?: (caseItem: CaseData) => void;
}

export default function CaseTable({ cases, onEdit }: CaseTableProps) {
  return (
    <div className="min-w-full overflow-x-auto mt-4 rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        {/* Wrapper for both header and body */}
        <div className="inline-block w-full align-middle">
          {/* Header */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
              <thead className="bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
                <tr>
                  <th className="py-3 px-4 rounded-tl-xl w-[16%]">Case Name</th>
                  <th className="py-3 px-4 w-[16%]">Crop Name</th>
                  <th className="py-3 px-4 w-[16%]">Submitted By</th>
                  <th className="py-3 px-4 w-[16%]">Location</th>
                  <th className="py-3 px-4 w-[16%]">Priority</th>
                  <th className="py-3 px-4 w-[14%]">Status</th>
                  <th className="py-3 px-4 rounded-tr-xl w-[6%] text-center">
                    Action
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable body */}
          <div className="max-h-[480px] overflow-y-auto">
            <table className="min-w-full table-fixed text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[6%]" />
              </colgroup>
              <tbody className="bg-[var(--background-color)]">
                {cases.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--taupe)] hover:bg-[var(--accent-color)]/10 transition text-center"
                  >
                    <td className="lg:whitespace-nowrap py-3 px-4">{item.caseName}</td>
                    <td className="lg:whitespace-nowrap py-3 px-4">{item.cropName}</td>
                    <td className="lg:whitespace-nowrap py-3 px-4">{item.submittedBy}</td>
                    <td className="lg:whitespace-nowrap py-3 px-4">{item.location}</td>
                    <td className="lg:whitespace-nowrap py-3 px-4">
                      {item.priority && item.priority !== "------" ? (
                        <StatusBox status={item.priority} fontSize="0.75rem" />
                      ) : (
                        <span className="text-gray-400">------</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBox status={item.status} fontSize="0.75rem" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg[var(--hover-primary)]"
                        aria-label="Edit"
                      >
                        <FontAwesomeIcon icon={faPen} style={{ width: "12px", height: "12px" }}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}