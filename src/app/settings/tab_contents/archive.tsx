"use client";
import WikiMoldTable, { type WikiMold } from "@/components/tables/wikimold_table";
import EmptyState from "@/components/empty_state";
import ConfirmationModal from "@/components/modals/confirmation_modal";
import { useState, useEffect } from "react";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { mutate } from 'swr';

/**
 * Archive Component
 * Displays a table of WikiMold articles that have been archived by the user
 * These are WikiMolds that were removed from the active content management list
 * Users can restore or permanently delete archived WikiMolds from this page
 */
export default function Archive() {
  // State to store archived wikimold data - initialize as empty, will be loaded from API
  const [archivedWikiMolds, setArchivedWikiMolds] = useState<WikiMold[]>([]);
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for confirmation modal (unarchive)
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedWikiMoldToRestore, setSelectedWikiMoldToRestore] = useState<WikiMold | null>(null);

  /**
   * Fetch archived WikiMold data from backend API
   * The API endpoint now properly filters archived moldipedia articles
   */
  useEffect(() => {
    // Fetch archived WikiMolds from backend
    const fetchArchivedWikiMolds = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v1/moldipedia/archive', { credentials: "include" });
        const json = await res.json();
        if (json?.success && json.data?.snapshot && Array.isArray(json.data.snapshot)) {
          // Map API shape to UI shape where needed
          const mapped = json.data.snapshot.map((it: any) => ({
            id: it.id,
            title: it.title,
            coverImage: it.cover_photo || it.coverImage || "",
            datePublished: it.created_at || it.datePublished || "",
          }));
          setArchivedWikiMolds(mapped);
          try {
            localStorage.setItem("archivedWikiMolds", JSON.stringify(mapped));
          } catch (e) {
            // ignore
          }
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error fetching archived wikimolds from API:", err);
        setError("Failed to load archived wikimolds");
        
        // Fallback: try localStorage for offline support
        try {
          const stored = localStorage.getItem("archivedWikiMolds");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArchivedWikiMolds(parsed);
              setError(null); // Clear error if localStorage has data
            }
          }
        } catch (parseErr) {
          console.error("Error parsing cached archived wikimolds:", parseErr);
        }
      }
      setIsLoading(false);
    };

    fetchArchivedWikiMolds();
  }, []);

  /**
   * Handle unarchive action - restore archived WikiMold back to active
   * Calls the backend API to unarchive the article
   */
  const handleRestoreWikiMold = (wikimold: WikiMold) => {
    // Show confirmation modal before unarchiving
    setSelectedWikiMoldToRestore(wikimold);
    setShowRestoreModal(true);
  };

  /**
   * Confirm and execute unarchive
   */
  const confirmRestoreWikiMold = async () => {
    if (!selectedWikiMoldToRestore) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/moldipedia/${selectedWikiMoldToRestore.id}/unarchive`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.error || "Failed to restore");
      }
      // Remove from archived list locally
      const updated = archivedWikiMolds.filter(w => w.id !== selectedWikiMoldToRestore.id);
      setArchivedWikiMolds(updated);
      try {
        localStorage.setItem("archivedWikiMolds", JSON.stringify(updated));
      } catch (e) {}

      // Revalidate SWR cache to sync with main content-management page
      // This allows the unarchived article to appear in the main WikiMold list
      await Promise.all([
        mutate(`/api/v1/moldipedia/${selectedWikiMoldToRestore.id}`),
        // Revalidate all moldipedia list-level caches (including infinite scroll)
        mutate(
          (key: unknown) => typeof key === 'string' && (key.startsWith('/api/v1/moldipedia') || key.startsWith('$inf$/api/v1/moldipedia')),
          undefined,
          { revalidate: true },
        ),
      ]);
    } catch (err) {
      console.error("Error restoring archived wikimold:", err);
      setError("Failed to restore archived wikimold - please try again");
    } finally {
      setIsLoading(false);
      setShowRestoreModal(false);
      setSelectedWikiMoldToRestore(null);
    }
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
