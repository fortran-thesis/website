"use client";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsProgress, faBell, faCalendar, faCheck, faCheckDouble, faCircle, faCircleCheck, faCircleXmark, faClipboard, faClock } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import MonthlyCasesChart from '@/components/charts/monthly-chart';
import PriorityBreakdown from '@/components/tiles/priority_breakdown_tile';
import CaseTable from '@/components/tables/case_table';
import AuthDebug from '@/components/auth-debug';

const userRole = "Administrator";

const chartData = [
  { month: "Jan", cases: 18 },
  { month: "Feb", cases: 12 },
  { month: "Mar", cases: 11 },
  { month: "Apr", cases: 9 },
  { month: "May", cases: 14 },
  { month: "Jun", cases: 15 },
  { month: "Jul", cases: 21 },
  { month: "Aug", cases: 18 },
  { month: "Sep", cases: 10 },
  { month: "Oct", cases: 8 },
  { month: "Nov", cases: 14 },
  { month: "Dec", cases: 17 },
];

const priorityData = {
    high: 12,
    medium: 20,
    low: 8,
};

const cases = [
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
  ];

export default function Home() {
    // Dummy user object for demonstration; replace with actual user data as needed
    const user = {
        profileImageUrl: "/assets/Wrong_Image1.png",
        name: "Karl Manuel Diata",
        role: "Administrator"
    };
    const notification = 2; // Example notification count



    return (
        <main className="relative flex flex-col xl:py-2 py-10">
            {/* Debug Component - Remove this in production */}
            <AuthDebug />
            
            {/* Header Section */}
            <div className="flex flex-row justify-between">
                <div className="flex flex-col w-full">
                    <Breadcrumbs role={userRole} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        DASHBOARD
                    </h1>
                </div>

                <div className="w-full flex flex-row justify-end items-center gap-x-10">
                    {/* Notification Bell with Badge */}
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faBell}
                            className="text-[var(--primary-color)] ml-5 mt-1 cursor-pointer hover:text-[var(--hover-primary)] transition"
                            style={{ width: '24px', height: '24px' }}
                        />
                        {notification > 0 && (
                            <span className="absolute bottom-1/2 right-0 block h-2 w-2 rounded-full ring-2 ring-[var(--background-color)] bg-[var(--moldify-red)]"></span>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex gap-x-2 items-center">
                        <img
                            src={user?.profileImageUrl || "/assets/FallBack_Image.png"}
                            alt="Profile picture"
                            width={40}
                            height={40}
                            className="rounded-full shadow-md"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/assets/FallBack_Image.png";
                            }}
                        />
                        <div className="hidden lg:flex flex-col">
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm">
                                {user?.name || "Unknown User"}
                            </p>
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-xs">
                                {user?.role || "Unknown Role"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Header Section */}

            {/* Statistics Tiles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-3 mt-6">
                <StatisticsTile icon={faClock} iconColor="var(--accent-color)" title="Pending Cases" statNum={0} />
                <StatisticsTile icon={faBarsProgress} iconColor="var(--moldify-blue)" title="In Progress Cases" statNum={0} />
                <StatisticsTile icon={faCircleCheck} iconColor="var(--primary-color)" title="Resolved Cases" statNum={0} />
                <StatisticsTile icon={faCheckDouble} iconColor="var(--moldify-grey)" title="Closed Cases" statNum={0} />
                <StatisticsTile icon={faCircleXmark} iconColor="var(--moldify-red)" title="Rejected Cases" statNum={0} />
            </div>
            
            {/* Line Chart & Priority Level Breakdown */}
            <div className = "w-full my-8 flex flex-col lg:flex-row gap-x-10 gap-y-10">
                <div className="w-full lg:w-2/3">
                    <MonthlyCasesChart data={chartData} />
                </div>
                <div className="w-full lg:w-1/3">
                    <PriorityBreakdown data={priorityData} />
                </div>
            </div>            
            
            {/* Line Chart & Priority Level Breakdown */}
            <div className="mt-6 w-full">
                <h2 className="font-[family-name:var(--font-bricolage-grotesque)] font-extrabold text-[var(--primary-color)] mb-2">
                    Unassigned Mold Cases
                </h2>
                <CaseTable 
                    cases={cases} 
                    showPriority={false} 
                    showStatus={false} 
                    onEdit={(c) => {
                      window.location.href = '/investigation/view-case';
                  }}
                />
            </div>
                        
                              
        </main>
    );
}
