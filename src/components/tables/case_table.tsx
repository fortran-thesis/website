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
      <div className="h-[480px] overflow-y-auto">
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

          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
            <tr>
              <th className="py-3 px-4 rounded-tl-xl">Case Name</th>
              <th className="py-3 px-4">Crop Name</th>
              <th className="py-3 px-4">Submitted By</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-tr-xl text-center">Action</th>
            </tr>
          </thead>

          {/* Scrollable Body */}
          <tbody className="bg-[var(--background-color)]">
            {cases.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[var(--taupe)] hover:bg-[var(--accent-color)]/10 transition text-center"
              >
                <td className="lg:whitespace-nowrap py-3 px-4 truncate max-w-[150px]">{item.caseName}</td>
                <td className="lg:whitespace-nowrap py-3 px-4 truncate max-w-[120px]">{item.cropName}</td>
                <td className="lg:whitespace-nowrap py-3 px-4 truncate max-w-[140px]">{item.submittedBy}</td>
                <td className="lg:whitespace-nowrap py-3 px-4 truncate max-w-[160px]">{item.location}</td>
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
                    className="text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)]"
                    aria-label="Edit"
                  >
                    <FontAwesomeIcon icon={faPen} style={{ width: "12px", height: "12px" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
