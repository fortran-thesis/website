"use client";
import React from "react";

interface IdentificationHistoryTableData {
  genusID: string;
  genusName: string;
  dateIdentified: string;
}

interface IdentificationHistoryTableProps {
  identHistory: IdentificationHistoryTableData[];
}

export default function IdentificationHistoryTable({
  identHistory = [],
}: IdentificationHistoryTableProps) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--primary-color)] w-full overflow-auto bg-[var(--background-color)] shadow">
      <div className="inline-block w-full align-middle">
        {/* Header */}
        <div className="overflow-hidden">
          <table className="w-full text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
            <thead className="bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
              <tr>
                <th className="py-3 px-4 text-center rounded-tl-xl w-[33%]">Genus ID</th>
                <th className="py-3 px-4 text-center w-[33%]">Genus Name</th>
                <th className="py-3 px-4 text-center rounded-tr-xl w-[33%]">
                  Date Identified
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable body */}
        <div className="h-[480px] overflow-y-auto">
          <table className="min-w-full text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
            <colgroup>
              <col className="w-[33%]" />
              <col className="w-[33%]" />
              <col className="w-[33%]" />
            </colgroup>
            <tbody className="bg-[var(--background-color)] divide-y divide-[var(--taupe)]">
              {identHistory.length > 0 ? (
                identHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[var(--accent-color)]/10 transition-colors text-center"
                  >
                    <td className="lg:whitespace-nowrap py-3 px-4 font-medium">
                      {item.genusID}
                    </td>
                    <td className="lg:whitespace-nowrap py-3 px-4">
                      {item.genusName}
                    </td>
                    <td className="lg:whitespace-nowrap py-3 px-4">
                      {item.dateIdentified}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-[var(--moldify-grey)] italic"
                  >
                    No identification history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
}
