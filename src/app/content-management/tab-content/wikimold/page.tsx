"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBook, faPlus } from "@fortawesome/free-solid-svg-icons";
import StatisticsTile from "@/components/tiles/statistics_tile";
import WikiMoldTable, { type WikiMold } from "@/components/tables/wikimold_table";
import StatusDropdown from '@/components/StatusDropdown';

interface WikiMoldManagementProps {
  wikimoldData: WikiMold[];
  setWikiMoldData: (data: WikiMold[]) => void;
  onEditWikiMold?: (wikimold: WikiMold) => void;
  onArchiveWikiMold?: (wikimold: WikiMold) => void;
  onAddWikiMold?: () => void;
}

export default function WikiMoldManagement({ wikimoldData = [], setWikiMoldData, onEditWikiMold, onArchiveWikiMold, onAddWikiMold }: WikiMoldManagementProps) {
  const [search, setSearch] = useState("");
  const [dateOrder, setDateOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateSortSelection, setDateSortSelection] = useState("");

  // Unified client-side search: title and datePublished
  const searchLower = search.trim().toLowerCase();
  const filteredData = wikimoldData.filter((item) => {
    return (
      !searchLower ||
      item.title?.toLowerCase().includes(searchLower) ||
      item.datePublished?.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    const aTs = a.datePublishedTs ?? 0;
    const bTs = b.datePublishedTs ?? 0;
    return dateOrder === 'newest' ? bTs - aTs : aTs - bTs;
  });

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
      <div className="mt-10 space-y-4 w-full">
        {/* Top Row: Label + Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
            WikiMold
          </p>

          {/* ADD BUTTON: moved to top row */}
          <button
            onClick={onAddWikiMold}
            className="flex items-center justify-center gap-3 h-12 px-8 rounded-xl bg-[var(--primary-color)] text-white font-[family-name:var(--font-bricolage-grotesque)] font-bold text-sm hover:bg-[var(--hover-primary)] active:scale-95 transition-all cursor-pointer shadow-md self-start sm:self-auto"
          >
            <span>Add WikiMold</span>
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
          </button>
        </div>

        {/* Controls Row: Search + Date Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
          
          {/* SEARCH: Unified with the button height and border style */}
          <div className="relative flex items-center w-full lg:flex-1">
            <label htmlFor="search" className="sr-only">Search WikiMold</label>
            <input
              id="search"
              type="text"
              placeholder="Search WikiMold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 px-6 rounded-full border-2 border-[var(--primary-color)] bg-[var(--background-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all pr-12"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute right-5 text-[var(--primary-color)] opacity-60" 
            />
          </div>

          <div className="w-full sm:w-44 lg:w-44 lg:flex-none">
            <StatusDropdown
              options={[
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
              ]}
              onSelect={(value) => {
                setDateSortSelection(value);
                setDateOrder(value === 'oldest' ? 'oldest' : 'newest');
              }}
              placeholder="Sort By Date"
              selectedValue={dateSortSelection}
              backgroundColor="var(--accent-color)"
              textColor="var(--moldify-black)"
              borderColor="var(--accent-color)"
            />
          </div>
        </div>
      </div>

      {/* Wikimold Table */}
      <div className="mt-6 w-full">
        <WikiMoldTable 
          data={filteredData}
          onEdit={onEditWikiMold}
          onArchive={onArchiveWikiMold}
        />
      </div>
    </>
  );
}
