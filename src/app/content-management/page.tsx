"use client";
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import TabBar from '@/components/tab_bar';
import MoldInfo from './tab-content/mold-info/page';
import { faBacterium, faBook } from '@fortawesome/free-solid-svg-icons';
import { type MoldGenus } from '@/components/tables/mold_genus_table';
import { type WikiMold } from '@/components/tables/wikimold_table';
import WikiMoldManagement from './tab-content/wikimold/page';
import ConfirmModal from '@/components/modals/confirmation_modal';

// Dummy data for mold genus
const DUMMY_MOLD_DATA: MoldGenus[] = [
  {
    id: "MG-001",
    genusName: "Aspergillus",
    reviewedBy: "Dr. Maria Santos",
    dateReviewed: "2024-01-15",
  },
  {
    id: "MG-002",
    genusName: "Penicillium",
    reviewedBy: "Dr. Juan Dela Cruz",
    dateReviewed: "2024-01-10",
  },
  {
    id: "MG-003",
    genusName: "Fusarium",
    reviewedBy: "Dr. Maria Santos",
    dateReviewed: "2024-01-20",
  },
  {
    id: "MG-004",
    genusName: "Alternaria",
    reviewedBy: "Dr. Juan Dela Cruz",
    dateReviewed: "2024-01-18",
  },
  {
    id: "MG-005",
    genusName: "Cladosporium",
    reviewedBy: "Dr. Maria Santos",
    dateReviewed: "2024-01-22",
  },
  
];

// Dummy data for WikiMold
const DUMMY_WIKIMOLD_DATA: WikiMold[] = [
  {
    id: "WM-001",
    title: "Aspergillus: A Comprehensive Guide to Fungal Identification",
    coverImage: "/assets/mold1.jpg",
    datePublished: "2024-01-15",
  },
  {
    id: "WM-002",
    title: "Penicillium Species and Their Agricultural Impact",
    coverImage: "",
    datePublished: "2024-01-10",
  },
  {
    id: "WM-003",
    title: "Fusarium Contamination in Crops",
    coverImage: "/assets/mold2.jpg",
    datePublished: "2024-01-20",
  },
  {
    id: "WM-004",
    title: "Trichoderma: Beneficial Molds in Agriculture",
    coverImage: "",
    datePublished: "2024-01-18",
  },
];

export default function ContentManagement() {
    const router = useRouter();
    const userRole = "Mycologist";
    const [moldData, setMoldData] = useState<MoldGenus[]>(DUMMY_MOLD_DATA);
    const [wikimoldData, setWikiMoldData] = useState<WikiMold[]>(DUMMY_WIKIMOLD_DATA);
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
