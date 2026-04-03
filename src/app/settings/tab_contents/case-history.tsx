"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CaseTable from "@/components/tables/case_table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useClosedReportsInfinite, type MoldReportSnapshot } from "@/hooks/swr";

interface CaseData {
  caseName: string;
  cropName: string;
  location: string;
  submittedBy: string;
  dateSubmitted: string;
  status: string;
}

/**
 * Case History Component
 * Displays a table of rejected mold investigation cases
 * Only shows cases with terminal rejected status
 */
export default function CaseHistory() {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const {
    data: casePages,
    setSize,
    isLoading,
    isValidating,
    error,
  } = useClosedReportsInfinite(50);

  const hasMore = !!casePages?.[casePages.length - 1]?.data?.nextPageToken;

  useEffect(() => {
    if (!hasMore || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 },
    );

    const current = loadMoreRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [hasMore, isValidating, setSize]);

  const mapReportToCase = (item: MoldReportSnapshot): CaseData => {
    let formattedDate = "N/A";
    if (typeof item.date_observed === "string" && item.date_observed) {
      const parsedDate = new Date(item.date_observed);
      formattedDate = Number.isNaN(parsedDate.getTime())
        ? item.date_observed
        : parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          });
    }

    const status = item.status || "Rejected";
    const normalizedStatus = status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Rejected";

    return {
      caseName: item.id || "N/A",
      cropName: item.case_name || item.host || "N/A",
      location: item.location || item.mold_case?.location || item.reporter?.address || "N/A",
      submittedBy: item.reporter?.name || 'N/A',
      dateSubmitted: formattedDate,
      status: normalizedStatus,
    };
  };

  const closedCases = useMemo<CaseData[]>(() => {
    if (!casePages) return [];
    return casePages.flatMap((page) => (page?.data?.snapshot ?? []).map(mapReportToCase));
  }, [casePages]);

  const filteredClosedCases = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return closedCases;

    return closedCases.filter((item) =>
      [
        item.caseName,
        item.cropName,
        item.location,
        item.submittedBy,
        item.dateSubmitted,
        item.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchLower)),
    );
  }, [closedCases, search]);

  const errorMessage = error ? "Failed to load rejected cases." : null;

  /**
   * Handle view case - navigate to view case page
   * Since cases are closed, only viewing is allowed (no editing)
   */
  const handleViewCase = (caseItem: CaseData) => {
    console.log("Viewing rejected case:", caseItem.caseName);
    // Use client-side navigation so returning preserves consistent UI state.
    const params = new URLSearchParams({ id: caseItem.caseName });
    router.push(`/investigation/view-case?${params.toString()}`);
  };

  return (
    <div>
      <header className="mt-10 mb-12 flex flex-col gap-2">
        <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight leading-none">
          Case History
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          Rejected Mold Investigation Records
        </p>
      </header>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
    
      {/* Mold Genus Section */}
      <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
          Rejected Cases
        </p>

        {/* Right Section */}
        <div className="flex flex-col lg:flex-row lg:ml-auto gap-x-2 gap-y-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex items-center w-full lg:w-100">
            <label htmlFor="search" className="sr-only">
              Search Closed Cases
            </label>

            <input
              id="search"
              placeholder="Search Rejected Case"
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
      {/* Case Table - Shows only closed cases with eye icon for viewing */}
      {isLoading ? (
        <div className="p-6 text-center text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Loading closed cases...
        </div>
      ) : (
        <CaseTable
          cases={filteredClosedCases}
          onEdit={handleViewCase}
          showStatus={true}
          showAction={true}
          useViewIcon={true}
        />
      )}

      <div ref={loadMoreRef} className="py-4 text-center">
        {isValidating && hasMore && (
          <p className="text-sm text-[var(--moldify-grey)]">Loading more closed cases...</p>
        )}
      </div>
    </div>
  );
}
