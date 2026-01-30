"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBacterium } from "@fortawesome/free-solid-svg-icons";
import StatisticsTile from "@/components/tiles/statistics_tile";
import MoldGenusTable, { type MoldGenus } from "@/components/tables/mold_genus_table";

interface MoldInfoProps {
  moldData: MoldGenus[];
  setMoldData: (data: MoldGenus[]) => void;
  onEditMold?: (mold: MoldGenus) => void;
}

export default function MoldInfo({ moldData, setMoldData, onEditMold }: MoldInfoProps) {
  const [search, setSearch] = useState("");

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
      <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
          Mold Genus
        </p>

        {/* Right Section */}
        <div className="flex flex-col lg:flex-row lg:ml-auto gap-x-2 gap-y-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex items-center w-full lg:w-100">
            <label htmlFor="search" className="sr-only">
              Search Mold Genus
            </label>

            <input
              id="search"
              placeholder="Search Mold Genus"
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

      {/* Mold Genus Table */}
      <div className="mt-6 w-full">
        <MoldGenusTable
          data={moldData}
          onEdit={onEditMold}
        />
      </div>
    </>
  );
}
