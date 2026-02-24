"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import TabBar from '@/components/tab_bar';
import MoldInfo from './tab-content/mold-info/page';
import { faBacterium, faBook } from '@fortawesome/free-solid-svg-icons';
import { type MoldGenus } from '@/components/tables/mold_genus_table';
import { type WikiMold } from '@/components/tables/wikimold_table';
import WikiMoldManagement from './tab-content/wikimold/page';
import ConfirmModal from '@/components/modals/confirmation_modal';

export default function ContentManagement() {
    const router = useRouter();
    const userRole = "Mycologist";
    const [moldData, setMoldData] = useState<MoldGenus[]>([]);
    const [wikimoldData, setWikiMoldData] = useState<WikiMold[]>([]);

    // Fetch mold genus list from API
    useEffect(() => {
      const fetchMolds = async () => {
        try {
          const res = await fetch('/api/v1/mold?limit=100', { cache: 'no-store', credentials: 'include' });
          if (!res.ok) return;
          const body = await res.json();
          const items: any[] = body.data?.snapshot ?? body.data ?? [];
          setMoldData(items.map((m: any) => ({
            id: m.id,
            genusName: m.name || '',
            reviewedBy: m.metadata?.updated_by || '',
            dateReviewed: m.metadata?.created_at?._seconds
              ? new Date(m.metadata.created_at._seconds * 1000).toISOString().split('T')[0]
              : (m.metadata?.created_at ?? ''),
          })));
        } catch { /* silently fail, table stays empty */ }
      };
      fetchMolds();
    }, []);

    // Fetch wikimold list from API
    useEffect(() => {
      const fetchWikiMolds = async () => {
        try {
          const res = await fetch('/api/v1/moldipedia?limit=100', { cache: 'no-store' });
          if (!res.ok) return;
          const body = await res.json();
          const items: any[] = body.data?.snapshot ?? body.data ?? [];
          setWikiMoldData(items.map((w: any) => ({
            id: w.id,
            title: w.title || '',
            coverImage: w.cover_photo || '',
            datePublished: w.metadata?.created_at?._seconds
              ? new Date(w.metadata.created_at._seconds * 1000).toISOString().split('T')[0]
              : (w.metadata?.created_at ?? ''),
          })));
        } catch { /* silently fail */ }
      };
      fetchWikiMolds();
    }, []);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [selectedWikiMold, setSelectedWikiMold] = useState<WikiMold | null>(null);
    
    const handleEditMold = (mold: MoldGenus) => {
      router.push(`/content-management/tab-content/mold-info/view-mold-info?id=${mold.id}`);
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
    
    const confirmArchiveWikiMold = () => {
      if (selectedWikiMold) {
        setWikiMoldData(wikimoldData.filter(w => w.id !== selectedWikiMold.id));
      }
      setShowArchiveModal(false);
      setSelectedWikiMold(null);
    };
    
    const tabs = useMemo(() => [
        {
            label: "Mold Information",
            icon: faBacterium,
            content: <MoldInfo 
            moldData={moldData} 
            setMoldData={setMoldData} 
            onEditMold={handleEditMold} 
            />,
        },
         {
            label: "WikiMold",
            icon: faBook,
            content: <WikiMoldManagement 
            wikimoldData={wikimoldData} 
            setWikiMoldData={setWikiMoldData} 
            onEditWikiMold={handleEditWikiMold} 
            onArchiveWikiMold={handleArchiveWikiMold} 
            onAddWikiMold={handleAddWikiMold} 
            />,
        },
    ], [moldData, setMoldData, wikimoldData, setWikiMoldData]);

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
              onCancel={() => {
                setShowArchiveModal(false);
                setSelectedWikiMold(null);
              }}
              onConfirm={confirmArchiveWikiMold}
            />
        </main>
    );
}
