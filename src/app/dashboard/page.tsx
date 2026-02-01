"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBacterium, faBell, faBookOpen, faHourglassHalf, faSeedling, faTriangleExclamation, faUsers } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import MonthlyCasesChart from '@/components/charts/monthly-chart';
import PriorityBreakdown from '@/components/tiles/priority_breakdown_tile';
import CaseTable from '@/components/tables/case_table';
import AuthDebug from '@/components/auth-debug';
import NotificationsPanel, { type NotificationItem } from '@/components/notifications_panel';
import DonutChart from '@/components/charts/donut-chart';

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
      priority: "Low",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "High",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Medium",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low",
      status: "In Progress",
    },
  ];

export default function Home() {
    // Dummy user object for demonstration; replace with actual user data from your auth system
    const user = {
        profileImageUrl: "/assets/Wrong_Image1.png",
        name: "Karl Manuel Diata",
        role: "Mycologist" // Change to "Mycologist" to see different layout
    };

    // Determine dashboard content based on user role
    const isAdministrator = user.role === "Administrator";
    const isMycologist = user.role === "Mycologist";

    const notifications: NotificationItem[] = [
        {
            id: 1,
            title: "New mold case assigned",
            body: "Case #MC-1023 has been assigned to you.",
            time: "2 min ago",
        },
        {
            id: 2,
            title: "Report updated",
            body: "Monthly report has been updated by Admin.",
            time: "1 hr ago",
        },
    ];

    const statusBreakDown = [
        { name: "In Progress", value: 10, color: "var(--moldify-blue)" },
        { name: "Resolved", value: 30, color: "var(--primary-color)" },
    ];

    const notificationCount = notifications.length;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const fallbackProfileImage = "/assets/default-fallback.png";
    const [profileImageSrc, setProfileImageSrc] = useState(
        user?.profileImageUrl || fallbackProfileImage
    );



    return (
        <main className="relative flex flex-col xl:py-2 py-10">
            {/* Debug Component - Remove this in production */}
            <AuthDebug />

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
            />
            
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
                        <button
                            aria-label="Open notifications"
                            onClick={() => setIsNotificationsOpen(true)}
                        >
                            <FontAwesomeIcon
                                icon={faBell}
                                className="text-[var(--primary-color)] ml-5 mt-1 cursor-pointer hover:text-[var(--hover-primary)] transition"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </button>
                        {notificationCount > 0 && (
                            <span className="absolute bottom-1/2 right-0 block h-2 w-2 rounded-full ring-2 ring-[var(--background-color)] bg-[var(--moldify-red)]"></span>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex gap-x-2 items-center">
                        <Image
                            src={profileImageSrc}
                            alt="pfp"
                            width={40}
                            height={40}
                            className="rounded-full shadow-md"
                            onError={() => {
                                setProfileImageSrc(fallbackProfileImage);
                            }}
                        />
                        <div className="hidden lg:flex flex-col">
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm">
                                {profileName || "Unknown User"}
                            </p>
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-xs">
                                {role || "Unknown Role"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Header Section */}

            {/* Statistics Tiles - Role-based */}
            {isAdministrator && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
                    <StatisticsTile icon={faUsers} iconColor="var(--accent-color)" title="Total Users" statNum={0} />
                    <StatisticsTile icon={faSeedling} iconColor="var(--accent-color)" title="Total Cases" statNum={0} />
                    <StatisticsTile icon={faTriangleExclamation} iconColor="var(--accent-color)" title="Total Reports" statNum={0} />
                </div>
            )}

            {isMycologist && (
                <div className="flex flex-col xl:flex-row w-full mt-6 gap-x-2 gap-y-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full xl:w-2/3">
                        {/* Customize mycologist statistics here */}
                        <StatisticsTile icon={faBacterium} iconColor="var(--accent-color)" title="Total Mold Genus" statNum={0} />
                        <StatisticsTile icon={faSeedling} iconColor="var(--accent-color)" title="Total Cases" statNum={0} />
                        <StatisticsTile icon={faHourglassHalf} iconColor="var(--accent-color)" title="In Progress Cases" statNum={0} />
                        <StatisticsTile icon={faBookOpen} iconColor="var(--accent-color)" title="Total Wikimold Published" statNum={0} />
                    </div>
                    <div className="w-fill xl:w-1/3">
                        <DonutChart
                            title="User Status Breakdown"
                            data={statusBreakDown}
                        />
                    </div>
                </div>
            )}
            
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
                    showPriority={isMycologist}
                    showStatus={false} 
                    onEdit={(c: any) => {
                      window.location.href = '/investigation/view-case';
                  }}
                />
            </div>
                        
                              
        </main>
    );
}
