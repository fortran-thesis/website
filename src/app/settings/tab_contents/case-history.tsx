"use client";
import { useState, useEffect } from "react";
import CaseTable from "@/components/tables/case_table";
import EmptyState from "@/components/empty_state";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

interface CaseData {
  caseName: string;
  cropName: string;
  location: string;
  submittedBy: string;
  dateSubmitted: string;
  priority: string;
  status: string;
}

/**
 * Dummy data for closed cases
 * This is used for development/testing purposes
 * TODO: Remove this and use actual API responses when backend is ready
 */
const DUMMY_CLOSED_CASES: CaseData[] = [
  {
    caseName: "CASE-2024-001",
    cropName: "Rice",
    location: "Nueva Ecija",
    submittedBy: "Juan Dela Cruz",
    dateSubmitted: "2024-01-15",
    priority: "High",
    status: "Closed",
  },
  {
    caseName: "CASE-2024-002",
    cropName: "Corn",
    location: "Isabela",
    submittedBy: "Maria Santos",
    dateSubmitted: "2024-01-10",
    priority: "Medium",
    status: "Closed",
  },
  {
    caseName: "CASE-2024-003",
    cropName: "Tomato",
    location: "Benguet",
    submittedBy: "Pedro Garcia",
    dateSubmitted: "2024-01-08",
    priority: "Low",
    status: "Closed",
  },
];

/**
 * Case History Component
 * Displays a table of closed mold investigation cases
 * Only shows cases with status "Closed"
 */
export default function CaseHistory() {
  const [closedCases, setClosedCases] = useState<CaseData[]>(DUMMY_CLOSED_CASES);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch closed cases from backend
   * Currently loads dummy data
   * TODO: Replace with actual API call when backend server is ready
   * Example API endpoint: GET /api/v1/cases?status=closed
   */
  useEffect(() => {
    // Dummy data is already loaded in initial state
    setIsLoading(false);

    // TODO: Uncomment when backend API is ready
    // const fetchClosedCases = async () => {
    //   try {
    //     setIsLoading(true);
    //     const response = await apiClient.get(endpoints.cases.getByStatus('closed'));
    //     if (response.success && Array.isArray(response.data)) {
    //       setClosedCases(response.data);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching closed cases:", err);
    //     setError("Failed to load closed cases");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchClosedCases();
  }, []);

  /**
   * Handle view case - navigate to view case page
   * Since cases are closed, only viewing is allowed (no editing)
   */
  const handleViewCase = (caseItem: CaseData) => {
    console.log("Viewing closed case:", caseItem.caseName);
    // Navigate to view case page using window.location (same as investigation page)
    const params = new URLSearchParams({
      id: caseItem.caseName,
      priority: caseItem.priority || "",
    });
    window.location.href = `/investigation/view-case?${params.toString()}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
        Case History
      </h2>
      <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] mb-6">
        Your record of closed mold investigations.
      </p>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    
      {/* Mold Genus Section */}
      <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
        {/* Left Label */}
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
            Closed Cases
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
              placeholder="Search Closed Case"
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
      ) : closedCases.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={faFolderOpen}
            title="No Closed Cases"
            message="You don't have any closed cases yet. Completed investigations will appear here."
          />
        </div>
      ) : (
        <CaseTable
          cases={closedCases}
          onEdit={handleViewCase}
          showPriority={true}
          showStatus={true}
          showAction={true}
          useViewIcon={true}
        />
      )}
    </div>
  );
}
