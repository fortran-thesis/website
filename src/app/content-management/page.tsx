  "use client";
  import { useEffect, useMemo, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import Breadcrumbs from '@/components/breadcrumbs_nav';
  import TabBar from '@/components/tab_bar';
  import MoldInfo from './tab-content/mold-info/page';
  import { faBacterium, faBook } from '@fortawesome/free-solid-svg-icons';
  import { type MoldGenus } from '@/components/tables/mold_genus_table';
  import { type WikiMold } from '@/components/tables/wikimold_table';
  import WikiMoldManagement from './tab-content/wikimold/page';
  import ConfirmModal from '@/components/modals/confirmation_modal';
  import { useAuth } from '@/hooks/useAuth';
  import { useMoldList, useMoldipediaList } from '@/hooks/swr';
  import { apiMutate, ApiError } from '@/lib/api';
import { invalidateMoldipedia } from '@/utils/cache-invalidation';
  export default function ContentManagement() {
      console.log('🚀 ContentManagement component rendering');
      const router = useRouter();
      const { user: authUser, loading: authLoading } = useAuth();
      console.log('🔐 Auth state:', { authUser, authLoading });
      
      // Map auth user data  
      const user = authUser ? {
          name: (authUser.user?.first_name && authUser.user?.last_name) 
              ? `${authUser.user.first_name} ${authUser.user.last_name}`
              : authUser.user?.username || authUser.name || "Guest User",
          role: authUser.user?.role || authUser.role || "admin"
      } : {
          name: "Guest User",
          role: "admin"
      };

      // Determine user role
      const isAdministrator = user.role === "admin" || user.role === "Administrator";
      const isMycologist = user.role === "mycologist" || user.role === "Mycologist";
      const userRole = user.role === "admin" ? "Administrator" : user.role === "mycologist" ? "Mycologist" : "User";
      
    // LOG ROLE DETECTION
    console.log('🔍 CONTENT MANAGEMENT ROLE DETECTION:');
    console.log('  authUser:', authUser);
    console.log('  user.role:', user.role);
    console.log('  isAdministrator:', isAdministrator);
    console.log('  isMycologist:', isMycologist);
    console.log('  userRole:', userRole);
    
    // SWR: fetch mold list
    const { data: moldRes, isLoading: isMoldLoading } = useMoldList();
    const moldData: MoldGenus[] = useMemo(() => {
      const snapshot = moldRes?.data?.snapshot;
      if (!Array.isArray(snapshot)) return [];
      return snapshot.map((m: any) => ({
        id: m.id || '',
        genusName: m.name || 'Unknown',
        reviewedBy: 'N/A',
        dateReviewed: 'N/A',
      }));
    }, [moldRes]);

    // SWR: fetch moldipedia articles
    const { data: wikiRes, isLoading: isWikiMoldLoading } = useMoldipediaList();
    const wikimoldDataFromApi: WikiMold[] = useMemo(() => {
      const snapshot = wikiRes?.data?.snapshot;
      if (!Array.isArray(snapshot)) return [];
      return snapshot.map((item: any) => {
        let datePublished = 'N/A';
        const metadata = item.metadata || {};
        const dateSource = metadata.created_at || metadata.timestamp || metadata.date || item.created_at;
        if (dateSource) {
          try {
            let dateObj;
            if (typeof dateSource === 'object' && '_seconds' in dateSource) {
              dateObj = new Date(dateSource._seconds * 1000);
            } else {
              dateObj = new Date(dateSource);
            }
            if (!isNaN(dateObj.getTime())) {
              datePublished = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            }
          } catch {
            datePublished = String(dateSource);
          }
        }
        return {
          id: item.id || '',
          title: item.title || 'Untitled',
          coverImage: item.cover_photo || '',
          datePublished,
        };
      });
    }, [wikiRes]);

    // Local state for wikimold (allows optimistic archive removal)
    const [wikimoldData, setWikiMoldData] = useState<WikiMold[]>([]);
    // Sync SWR data into local state whenever it changes (e.g. after archive revalidation,
    // or returning from the add-wikimold page with a newly created article).
    useEffect(() => {
      setWikiMoldData(wikimoldDataFromApi);
    }, [wikimoldDataFromApi]);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [selectedWikiMold, setSelectedWikiMold] = useState<WikiMold | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);
      
      const handleEditMold = (mold: MoldGenus) => {
        router.push(`/content-management/tab-content/mold-info/view-mold-info?id=${mold.id}`);
      };

      const handleAddMold = () => {
        router.push('/content-management/tab-content/mold-info/view-mold-info');
      };
      
      const handleEditWikiMold = (wikimold: WikiMold) => {
        router.push(`/content-management/tab-content/wikimold/view-wikimold?id=${wikimold.id}`);
      };
      
      const handleAddWikiMold = () => {
        router.push('/content-management/tab-content/wikimold/add-wikimold');
      };
      
      const handleArchiveWikiMold = (wikimold: WikiMold) => {
        setSelectedWikiMold(wikimold);
        setShowArchiveModal(true);
      };
      
      const confirmArchiveWikiMold = async () => {
        if (!selectedWikiMold) return;

        setIsArchiving(true);

        try {
          await apiMutate(`/api/v1/moldipedia/${selectedWikiMold.id}/archive`, {
            method: 'PATCH',
            body: {},
          });

          // Remove from local state
          setWikiMoldData(wikimoldData.filter(w => w.id !== selectedWikiMold.id));

          await invalidateMoldipedia();

          setShowArchiveModal(false);
          setSelectedWikiMold(null);
        } catch (err: any) {
          console.error('Archive failed:', err);
          alert(err?.message || 'Failed to archive article');
          setShowArchiveModal(false);
          setSelectedWikiMold(null);
        } finally {
          setIsArchiving(false);
        }
      };
      
      const tabs = useMemo(() => [
        {
          label: "Mold Information",
          icon: faBacterium,
          content: <MoldInfo 
            moldData={moldData} 
            isLoading={isMoldLoading}
            onEditMold={handleEditMold}
            onAddMold={handleAddMold}
          />,
        },
        {
          label: "Wikimold",
          icon: faBook,
          content: <WikiMoldManagement 
            wikimoldData={wikimoldData} 
            setWikiMoldData={setWikiMoldData} 
            onEditWikiMold={handleEditWikiMold} 
            onArchiveWikiMold={handleArchiveWikiMold} 
            onAddWikiMold={handleAddWikiMold} 
          />,
        },
      ], [moldData, wikimoldData, setWikiMoldData, isWikiMoldLoading]);

      // Show loading state while checking authentication
      if (authLoading) {
          return (
              <main className="relative flex flex-col xl:py-2 py-10 items-center justify-center min-h-screen">
                  <div className="text-center">
                      <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">
                          Loading content management...
                      </p>
                  </div>
              </main>
          );
      }

      return (
          <main className="relative flex flex-col xl:py-2 py-10 w-full">

              {/* Header Section */}
              <div className="flex flex-row justify-between">
                  <div className="flex flex-col">
                      <Breadcrumbs role={userRole} />
                      <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                          CONTENT MANAGEMENT
                      </h1>
                  </div>

              </div>
              {/* End Header Section */}
              <div className="mt-10">
                  <TabBar tabs={tabs} initialIndex={0} />
              </div>
              
              {/* Archive WikiMold Confirmation Modal */}
              <ConfirmModal
                isOpen={showArchiveModal}
                title="Archive WikiMold"
                subtitle={`Are you sure you want to archive "${selectedWikiMold?.title}"?`}
                cancelText="Cancel"
                confirmText="Archive"
                confirmDisabled={isArchiving}
                confirmLoadingText="Archiving..."
                onCancel={() => {
                  setShowArchiveModal(false);
                  setSelectedWikiMold(null);
                }}
                onConfirm={confirmArchiveWikiMold}
              />
          </main>
      );
  }
