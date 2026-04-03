"use client";
import { useState } from "react";
import FlaggedHistoryTable, { type FlaggedHistory } from "@/components/tables/flagged_history_table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
      <header className="mt-10 mb-12 flex flex-col gap-2">
        <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight leading-none">
          Flag History
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          Flagged Mold Identification Records
        </p>
      </header>

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
      ) : (
        <FlaggedHistoryTable 
          data={filteredHistory}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
