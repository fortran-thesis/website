"use client";

import { useState } from "react";
import StatusDropdown from '@/components/StatusDropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBacterium, faPlus } from "@fortawesome/free-solid-svg-icons";
import StatisticsTile from "@/components/tiles/statistics_tile";
import MoldGenusTable, { type MoldGenus } from "@/components/tables/mold_genus_table";

interface MoldInfoProps {
  moldData: MoldGenus[];
  isLoading: boolean;
  onEditMold?: (mold: MoldGenus) => void;
  onAddMold?: () => void;
}

export default function MoldInfo({ moldData = [], isLoading, onEditMold, onAddMold }: MoldInfoProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Reviewed", value: "reviewed" },
  ];

  // Unified client-side search + status filtering.
  const searchLower = search.trim().toLowerCase();
  const normalizedSelectedStatus = selectedStatus.trim().toLowerCase();
  const filteredData = moldData.filter((mold) => {
    const moldStatus = String(mold.status ?? "draft").trim().toLowerCase();
    const matchesStatus = normalizedSelectedStatus === "all" || moldStatus === normalizedSelectedStatus;
    if (!matchesStatus) return false;

    return (
      !searchLower ||
      mold.genusName?.toLowerCase().includes(searchLower) ||
      moldStatus.includes(searchLower) ||
      mold.reviewedBy?.toLowerCase().includes(searchLower) ||
      mold.dateReviewed?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {/* Statistics */}
      <div className="mt-3">
        <StatisticsTile
          icon={faBacterium}
          iconColor="var(--accent-color)"
          title="Total Mold Genus"
          statNum={moldData.length}
        />
      </div>

      {/* Mold Genus Section */}
      <div className="flex flex-col md:flex-row md:items-center mt-10 gap-4 w-full justify-between">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
          Mold Genus
        </p>

        {/* Right Section (Search + Filter + Add Button) */}
        <div className="flex flex-col md:flex-row md:ml-auto items-stretch md:items-center gap-3 w-full md:w-auto">
          
          {/* SEARCH: Matching h-11 and internal horizontal padding */}
          <div className="relative flex items-center w-full md:w-80 group">
            <label htmlFor="search" className="sr-only">Search Mold Genus</label>
            <input
              id="search"
              type="text"
              placeholder="Search Mold Genus"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 px-5 rounded-full border-2 border-[var(--primary-color)] bg-[var(--background-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all pr-12 placeholder:text-[var(--primary-color)]/40"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-70 group-focus-within:opacity-100 transition-opacity" 
            />
          </div>

          <div className="w-full md:w-30">
            <StatusDropdown
              options={statusOptions}
              onSelect={(value) => setSelectedStatus(value)}
              placeholder="Filter Status"
              selectedValue={selectedStatus}
              backgroundColor="var(--accent-color)"
              textColor="var(--moldify-black)"
              borderColor="var(--accent-color)"
            />
          </div>

          {/* ADD BUTTON: Match filter radius for visual consistency */}
          <button
            type="button"
            onClick={onAddMold}
            className="cursor-pointer flex items-center justify-center gap-3 h-11 px-6 rounded-xl border-2 border-[var(--primary-color)] bg-[var(--primary-color)] text-white font-[family-name:var(--font-bricolage-grotesque)] font-bold text-sm hover:bg-[var(--hover-primary)] transition-all active:scale-95 whitespace-nowrap shadow-sm"
          >
            <span>Add Mold Information</span>
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
          </button>

        </div>
      </div>

      {/* Mold Genus Table */}
      <div className="mt-6 w-full">
        <MoldGenusTable
          data={filteredData}
          onEdit={onEditMold}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
