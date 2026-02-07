"use client";
import React from "react";
import { faPills } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../empty_state";

interface TreatmentHistoryTableData {
  treatmentID: string;
  recommendedFungicides: string;
  additionalNotes: string;
  date: string;
}

interface TreatmentHistoryTableProps {
  treatmentHistory: TreatmentHistoryTableData[];
}

export default function TreatmentHistoryTable({
  treatmentHistory = [],
}: TreatmentHistoryTableProps) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow overflow-hidden">
      <div className="h-[600px] overflow-y-auto overflow-x-auto">
        {treatmentHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={faPills}
              title="No Treatment History"
              message="No treatment recommendations recorded yet."
            />
          </div>
        ) : (
        <table className="min-w-full w-full text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] border-collapse">
          <thead className="bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-center w-[25%] rounded-tl-xl">Treatment ID</th>
              <th className="py-3 px-4 text-center w-[25%]">Recommended Fungicides</th>
              <th className="py-3 px-4 text-center w-[25%]">Additional Notes</th>
              <th className="py-3 px-4 text-center w-[25%] rounded-tr-xl">Date</th>
            </tr>
          </thead>

          <tbody className="bg-[var(--background-color)] divide-y divide-[var(--taupe)]">
            {treatmentHistory.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-[var(--accent-color)]/10 transition-colors text-center"
              >
                <td className="lg:whitespace-nowrap py-3 px-4 font-medium">
                  {item.treatmentID}
                </td>
                <td className="lg:whitespace-nowrap py-3 px-4">
                  {item.recommendedFungicides}
                </td>
                <td className="py-3 px-4 break-words">{item.additionalNotes}</td>
                <td className="lg:whitespace-nowrap py-3 px-4">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
