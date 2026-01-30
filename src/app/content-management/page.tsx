"use client";
import { useMemo, useState } from 'react';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import TabBar from '@/components/tab_bar';
import MoldInfo from './tab-content/mold-info/page';
import { faBacterium, faBook } from '@fortawesome/free-solid-svg-icons';
import { type MoldGenus } from '@/components/tables/mold_genus_table';

// Dummy data for all content management
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

export default function ContentManagement() {
    const userRole = "Mycologist";
    const [moldData, setMoldData] = useState<MoldGenus[]>(DUMMY_MOLD_DATA);
    
    const tabs = useMemo(() => [
        {
            label: "Mold Information",
            icon: faBacterium,
            content: <MoldInfo moldData={moldData} setMoldData={setMoldData} />,
        },
         {
            label: "WikiMold",
            icon: faBook,
            content: <MoldInfo moldData={moldData} setMoldData={setMoldData} />,
        },
    ], [moldData, setMoldData]);

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
            
            
        </main>
    );
}
