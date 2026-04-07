"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faBacterium } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "@/components/empty_state";
import StatusBox from "@/components/tiles/status_tile";

export interface MoldGenus {
  id: string;
  genusName: string;
  status: string;
  reviewedBy: string;
  dateReviewed: string;
}

interface MoldGenusCTableProps {
  data: MoldGenus[];
  onEdit?: (mold: MoldGenus) => void;
  isLoading?: boolean;
}

export default function MoldGenusTable({ data, onEdit, isLoading = false }: MoldGenusCTableProps) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleEditClick = (mold: MoldGenus) => {
    setNavigatingId(mold.id);
    onEdit?.(mold);
  };

  if (isLoading) {
    return (
      <div className="text-center">
          <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">
              Loading mold data...
          </p>
      </div>
    );
  }

  return (
    <>
      {/* Top Loading Bar */}
      {navigatingId && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

      <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        <div className="h-[600px] overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={faBacterium}
              title="No Mold Data"
              message="No mold genus records found."
            />
          </div>
        ) : (
          <table className="min-w-full text-sm text-center font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
            <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
              <tr>
                <th className="py-3 px-6 text-center">Mold ID</th>
                <th className="py-3 px-6 text-center">Genus Name</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Reviewed By</th>
                <th className="py-3 px-6 text-center">Date Reviewed</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((mold, index) => (
                <tr
                  key={mold.id || index}
                  className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors"
                >
                  <td className="py-3 px-6 text-center text-[var(--moldify-black)]">{mold.id}</td>
                  <td className="py-3 px-6 text-center">{mold.genusName}</td>
                  <td className="py-3 px-6 text-center">
                    <StatusBox status={mold.status || "Draft"} fontSize="0.65rem" />
                  </td>
                  <td className="py-3 px-6 text-center">{mold.reviewedBy}</td>
                  <td className="py-3 px-6 text-center">{mold.dateReviewed}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleEditClick(mold)}
                      disabled={navigatingId === mold.id}
                      className={`text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)] ${
                        navigatingId === mold.id ? 'opacity-60 cursor-wait' : ''
                      }`}
                      aria-label="Edit"
                    >
                      <FontAwesomeIcon 
                        icon={faPen} 
                        className={navigatingId === mold.id ? 'animate-pulse' : ''}
                        style={{ width: "12px", height: "12px" }} 
                      />
                    </button>
                  </td>
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
