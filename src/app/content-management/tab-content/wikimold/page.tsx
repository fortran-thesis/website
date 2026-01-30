"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBook, faPlus } from "@fortawesome/free-solid-svg-icons";
import StatisticsTile from "@/components/tiles/statistics_tile";
import WikiMoldTable, { type WikiMold } from "@/components/tables/wikimold_table";

interface WikiMoldManagementProps {
  wikimoldData: WikiMold[];
  setWikiMoldData: (data: WikiMold[]) => void;
  onEditWikiMold?: (wikimold: WikiMold) => void;
  onArchiveWikiMold?: (wikimold: WikiMold) => void;
}

export default function WikiMoldManagement({ wikimoldData, setWikiMoldData, onEditWikiMold, onArchiveWikiMold }: WikiMoldManagementProps) {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Statistics */}
      <div className="mt-3">
        <StatisticsTile
          icon={faBook}
          iconColor="var(--accent-color)"
          title="Total WikiMold Published"
          statNum={wikimoldData.length}
        />
      </div>

      {/* WikiMold Section */}
      <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
          WikiMold
        </p>

        {/* Right Section */}
        <div className="flex flex-col lg:flex-row lg:ml-auto gap-x-2 gap-y-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex items-center w-full lg:w-100">
            <label htmlFor="search" className="sr-only">
              Search WikiMold
            </label>

            <input
              id="search"
              placeholder="Search WikiMold"
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
          <button
                className="flex items-center justify-center gap-2 font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--hover-primary)] transition-colors cursor-pointer text-sm"
                onClick={() => {/* Handle create mycologist account action */}}
            >
                <span>Add WikiMold</span>
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
      </div>

      {/* Wikimold Table */}
      <div className="mt-6 w-full">
        <WikiMoldTable 
          data={wikimoldData}
          onEdit={onEditWikiMold}
          onArchive={onArchiveWikiMold}
        />
      </div>
    </>
  );
}
