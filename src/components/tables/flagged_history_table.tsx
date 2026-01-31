"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../empty_state";

export interface FlaggedHistory {
  flagId: string;
  systemPredicted: string;
  correctedGenus: string;
  dateFlagged: string;
}

interface FlaggedHistoryTableProps {
  data: FlaggedHistory[];
  isLoading?: boolean;
}

export default function FlaggedHistoryTable({ data, isLoading = false }: FlaggedHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow p-6">
        <p className="text-center text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Loading flagged history...
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-full mt-4 overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
      <div className="h-[600px] overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={faFlag}
              title="No Flagged History"
              message="You haven't flagged any predictions yet. Flagged corrections will appear here."
            />
          </div>
        ) : (
          <table className="min-w-full text-sm text-left font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
            <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
              <tr>
                <th className="py-3 px-6 text-center">Flag ID</th>
                <th className="py-3 px-6 text-center">System Predicted</th>
                <th className="py-3 px-6 text-center">Corrected Genus</th>
                <th className="py-3 px-6 text-center">Date Flagged</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.flagId || index}
                  className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors"
                >
                  <td className="py-3 px-6 text-center text-[var(--moldify-black)]">
                    {item.flagId}
                  </td>
                  <td className="py-3 px-6 text-center text-[var(--moldify-black)]">
                    {item.systemPredicted}
                  </td>
                  <td className="py-3 px-6 text-center text-[var(--moldify-black)]">
                    {item.correctedGenus}
                  </td>
                  <td className="py-3 px-6 text-center text-[var(--moldify-black)]">
                    {item.dateFlagged}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
