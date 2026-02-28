"use client";
import { useState, useEffect } from "react";
import FlaggedHistoryTable, { type FlaggedHistory } from "@/components/tables/flagged_history_table";
import EmptyState from "@/components/empty_state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFlag } from "@fortawesome/free-solid-svg-icons";

/**
 * Dummy data for flagged history
 * This is used for development/testing purposes
 * TODO: Remove this and use actual API responses when backend is ready
 */
import { endpoints } from '@/services/endpoints';
import { apiClient } from "@/services";

// Map API response to FlaggedHistoryTable format
function mapApiFlagReport(item: any): FlaggedHistory {
  return {
    flagId: item.content_id || '',
    systemPredicted: item.content_type || '',
    correctedGenus: item.details || '',
    dateFlagged: item.dateFlagged || '',
  };
}
/**
 * Flag History Component
 * Displays a table of flagged mold genus predictions
 * Shows system predictions that were corrected by the mycologist
 */

interface FlagHistoryProps {
  flaggedHistory: FlaggedHistory[];
  isLoading: boolean;
  error: string | null;
}

export default function FlagHistory({ flaggedHistory, isLoading, error }: FlagHistoryProps) {
  const [search, setSearch] = useState("");

  // Filter flaggedHistory by search
  const filteredHistory = flaggedHistory.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.flagId.toLowerCase().includes(searchLower) ||
      item.systemPredicted.toLowerCase().includes(searchLower) ||
      item.correctedGenus.toLowerCase().includes(searchLower) ||
      item.dateFlagged.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
        Flag History
      </h2>
      <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] mb-6">
        Your record of previously flagged mold identifications below.
      </p>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
     
      {/* Flagged Genus Section */}
      <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
          Flagged History
        </p>

        {/* Right Section */}
        <div className="flex flex-col lg:flex-row lg:ml-auto gap-x-2 gap-y-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex items-center w-full lg:w-100">
            <label htmlFor="search" className="sr-only">
              Search Flagged Mold Genus
            </label>

            <input
              id="search"
              placeholder="Search Flagged Mold Genus"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-[family-name:var(--font-bricolage-grotesque)]
                text-[var(--moldify-black)] text-sm
                bg-[var(--background-color)]
                py-2 px-4 rounded-full
                border-2 border-[var(--primary-color)]
                focus:outline-none w-full pr-10"
            />

            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]"
            />
          </div>
        </div>
      </div>

      {/* Flagged History Table */}
      {isLoading ? (
        <div className="p-6 text-center text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Loading flagged history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={faFlag}
            title="No Flagged History"
            message="You haven't flagged any predictions yet. Flagged corrections will appear here."
          />
        </div>
      ) : (
        <FlaggedHistoryTable 
          data={filteredHistory}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
