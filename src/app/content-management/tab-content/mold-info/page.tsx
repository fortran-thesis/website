"use client";

import { useState } from "react";
import StatusDropdown from '@/components/StatusDropdown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBacterium } from "@fortawesome/free-solid-svg-icons";
import StatisticsTile from "@/components/tiles/statistics_tile";
import MoldGenusTable, { type MoldGenus } from "@/components/tables/mold_genus_table";
import { useAuth } from "@/hooks/useAuth";

interface MoldInfoProps {
  moldData: MoldGenus[];
  isLoading: boolean;
  onEditMold?: (mold: MoldGenus) => void;
}

export default function MoldInfo({ moldData, isLoading, onEditMold }: MoldInfoProps) {
  const [search, setSearch] = useState("");

  // Unified client-side search: genusName, reviewedBy, dateReviewed
  const searchLower = search.trim().toLowerCase();
  const filteredData = moldData.filter((mold) => {
    return (
      !searchLower ||
      mold.genusName?.toLowerCase().includes(searchLower) ||
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

        {/* Right Section (Search Bar) */}
        <div className="flex flex-col md:flex-row md:ml-auto gap-x-2 gap-y-3 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-100">
            <label htmlFor="search" className="sr-only">Search Mold Genus</label>
            <input
              id="search"
              placeholder="Search Mold Genus"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
          </div>
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
