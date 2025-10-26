"use client";
import React from "react";

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
        <table className="w-[1183px] text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] border-collapse">
          <thead className="bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-center w-[25%] rounded-tl-xl">Treatment ID</th>
              <th className="py-3 px-4 text-center w-[25%]">Recommended Fungicides</th>
              <th className="py-3 px-4 text-center w-[25%]">Additional Notes</th>
              <th className="py-3 px-4 text-center w-[25%] rounded-tr-xl">Date</th>
            </tr>
          </thead>

          <tbody className="bg-[var(--background-color)] divide-y divide-[var(--taupe)]">
            {treatmentHistory.length > 0 ? (
              treatmentHistory.map((item, index) => (
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
                  <td className="py-3 px-4">{item.additionalNotes}</td>
                  <td className="lg:whitespace-nowrap py-3 px-4">{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-[var(--moldify-grey)] italic"
                >
                  No treatment history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
