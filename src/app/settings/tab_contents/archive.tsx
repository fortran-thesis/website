"use client";
import WikiMoldTable, { type WikiMold } from "@/components/tables/wikimold_table";
import EmptyState from "@/components/empty_state";
import ConfirmationModal from "@/components/modals/confirmation_modal";
import { useState, useEffect } from "react";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";

/**
 * Dummy data for archived WikiMolds
 * This is used for development/testing purposes
 * TODO: Remove this and use actual API responses when backend is ready
 */
const DUMMY_ARCHIVED_WIKIMOLDS: WikiMold[] = [
  {
    id: "WM-ARCHIVED-001",
    title: "Aspergillus: A Comprehensive Guide to Fungal Identification",
    coverImage: "/assets/mold1.jpg",
    datePublished: "2024-01-15",
  },
  {
    id: "WM-ARCHIVED-002",
    title: "Penicillium Species and Their Agricultural Impact",
    coverImage: "",
    datePublished: "2024-01-10",
  },
  {
    id: "WM-ARCHIVED-003",
    title: "Trichoderma: Beneficial Molds in Agriculture",
    coverImage: "/assets/mold2.jpg",
    datePublished: "2024-01-18",
  },
];

/**
 * Archive Component
 * Displays a table of WikiMold articles that have been archived by the user
 * These are WikiMolds that were removed from the active content management list
 * Users can restore or permanently delete archived WikiMolds from this page
 */
export default function Archive() {
  // State to store archived wikimold data - initialize with dummy data
  const [archivedWikiMolds, setArchivedWikiMolds] = useState<WikiMold[]>(DUMMY_ARCHIVED_WIKIMOLDS);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for confirmation modal (unarchive)
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedWikiMoldToRestore, setSelectedWikiMoldToRestore] = useState<WikiMold | null>(null);

  /**
   * Fetch archived WikiMold data from backend or local storage
   * Currently loads from localStorage with dummy data fallback
   * TODO: Replace with actual API call when backend server is ready
   * Example API endpoint: GET /api/v1/wikimold/archived
   */
  useEffect(() => {
    // Dummy data is already loaded in initial state
    setIsLoading(false);

    // Try to load from localStorage if available
    try {
      const stored = localStorage.getItem("archivedWikiMolds");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArchivedWikiMolds(parsed);
        }
      }
    } catch (parseErr) {
      console.error("Error parsing archived wikimolds from localStorage:", parseErr);
      // Keep dummy data on error
    }

    // TODO: Uncomment when backend API is ready
    // const fetchArchivedWikiMolds = async () => {
    //   try {
    //     const response = await apiClient.get(endpoints.wikimold.archived);
    //     if (response.success && Array.isArray(response.data)) {
    //       setArchivedWikiMolds(response.data);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching archived wikimolds:", err);
    //     setError("Failed to load archived wikimolds");
    //   }
    // };
    // fetchArchivedWikiMolds();
  }, []);

  /**
   * Handle unarchive action - restore archived WikiMold back to active
   * This removes the WikiMold from archived list and returns it to the main content
   * 
   * TODO: When integrating backend:
   * - Call API to move WikiMold from archived to active
   * - Sync with content management page
   * - Update parent state if needed
   */
  const handleRestoreWikiMold = (wikimold: WikiMold) => {
    // Show confirmation modal before unarchiving
    setSelectedWikiMoldToRestore(wikimold);
    setShowRestoreModal(true);
  };

  /**
   * Confirm and execute unarchive
   */
  const confirmRestoreWikiMold = () => {
    if (!selectedWikiMoldToRestore) return;
    
    console.log("Restoring archived WikiMold:", selectedWikiMoldToRestore.id);
    
    // Remove from archived list
    const updated = archivedWikiMolds.filter(w => w.id !== selectedWikiMoldToRestore.id);
    setArchivedWikiMolds(updated);
    
    // Close modal and reset
    setShowRestoreModal(false);
    setSelectedWikiMoldToRestore(null);
    
    // TODO: API call for backend integration
    // await apiClient.post(endpoints.wikimold.restore(selectedWikiMoldToRestore.id));
  };

  /**
   * Cancel unarchive and close modal
   */
  const cancelRestoreWikiMold = () => {
    setShowRestoreModal(false);
    setSelectedWikiMoldToRestore(null);
  };

  return (
    <div className="mt-5">
      <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
        Archive
      </h2>
      <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] mb-6">
        Your collection of archived wikimolds.
      </p>

      {/* Error Message Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="p-6 text-center text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Loading archived wikimolds...
        </div>
      ) : archivedWikiMolds.length === 0 ? (
        /* Empty State - Show when no archived wikimolds exist */
        <EmptyState
          icon={faBoxArchive}
          title="No Archived WikiMolds"
          message="You haven't archived any WikiMold articles yet. Archived articles will appear here."
        />
      ) : (
        /* WikiMold Table - Only archive button visible on archive page */
        <WikiMoldTable 
          data={archivedWikiMolds}
          onArchive={handleRestoreWikiMold}  
          isLoading={isLoading}
          hideEdit={true}
        />
      )}

      {/* Unarchive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRestoreModal}
        onConfirm={confirmRestoreWikiMold}
        onCancel={cancelRestoreWikiMold}
        title="Unarchive WikiMold?"
        subtitle={`Do you want to move "${selectedWikiMoldToRestore?.title}" back to the WikiMold list?`}
        confirmText="Unarchive"
        cancelText="Cancel"
      />
    </div>
  );
}
