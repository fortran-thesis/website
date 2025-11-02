"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import StatusBox from "@/components/tiles/status_tile"; 

export interface Report {
  id: string;
  issue: string;
  reportedUser: string;
  reportedBy: string;
  dateReported: string;
  status: "Resolved" | "Unresolved";
}

interface ReportsTableProps {
  data: Report[];
  onEdit?: (report: Report) => void;
}

// Reports Table ---
export default function ReportsTable({ data, onEdit }: ReportsTableProps) {
  return (
    <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
      <div className="h-[600px] overflow-y-auto">
        <table className="min-w-full text-sm text-left font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
          {/* --- Table Header --- */}
          <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
            <tr>
              <th className="py-3 px-6">Issue</th>
              <th className="py-3 px-6">Reported User</th>
              <th className="py-3 px-6">Reported By (User ID)</th>
              <th className="py-3 px-6">Date Reported</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody>
            {data.length > 0 ? (
              data.map((report, index) => (
                <tr
                  key={report.id || index}
                  className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors text-center"
                >
                  <td className="py-3 px-6 truncate max-w-[150px]" title={report.issue}>
                    {report.issue}
                  </td>
                  <td className="py-3 px-6">{report.reportedUser}</td>
                  <td className="py-3 px-6 font-mono">{report.reportedBy}</td>
                  <td className="py-3 px-6 whitespace-nowrap">{report.dateReported}</td>
                  <td className="py-3 px-6">
                    <StatusBox
                      status={
                        report.status === "Resolved" ? "Unresolved" : "Resolved"
                      }
                    />
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => onEdit?.(report)}
                      className="text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)]"
                      aria-label="Edit Report"
                    >
                      <FontAwesomeIcon
                        icon={faPen}
                        style={{ width: "12px", height: "12px" }}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-gray-500 italic"
                >
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
