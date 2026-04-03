"use client";
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBacterium, faBell, faBookOpen, faHourglassHalf, faSeedling, faTriangleExclamation, faUsers } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import MonthlyCasesChart from '@/components/charts/monthly-chart';
import CaseTable from '@/components/tables/case_table';
import AuthDebug from '@/components/auth-debug';
import NotificationsPanel from '@/components/notifications_panel';
import DonutChart from '@/components/charts/donut-chart';
import {
  useUnassignedReports,
  useAssignedReports,
  useDashboardSummary,
  useNotifications,
  useUnreadNotificationCount,
  useNotificationMutations,
} from '@/hooks/swr';

const userRole = "Administrator";

export default function Home() {
    // Get authenticated user data from centralized auth hook
    const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
    
    // Fallback mock data for initial UI
    const fallbackChartData = [
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
    
    // Map auth user data - backend returns nested structure: {id, details, user: {...}}
    const user = authUser ? {
        profileImageUrl: authUser.details?.photo_url || authUser.profileImage || authUser.profileImageUrl || "/assets/Wrong_Image1.png",
        name: (authUser.user?.first_name && authUser.user?.last_name) 
            ? `${authUser.user.first_name} ${authUser.user.last_name}`
            : authUser.user?.username || authUser.name || "Guest User",
        role: authUser.user?.role || authUser.role || "admin" // Backend returns 'admin' not 'Administrator'
    } : {
        profileImageUrl: "/assets/Wrong_Image1.png",
        name: "Guest User",
        role: "admin" // Fallback role
    };

    // Helper function to format role for display (capitalize)
    const formatRole = (role: string): string => {
        if (!role) return "Unknown Role";
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    };

    // Determine dashboard content based on user role (backend uses lowercase 'admin' and 'mycologist')
    const resolvedRole = (authUser?.user?.role || authUser?.role || '').toLowerCase();
    const isAdministrator = !authLoading && resolvedRole === 'admin';
    const isMycologist = !authLoading && resolvedRole === 'mycologist';
    const canLoadDashboardData = !authLoading && (isAdministrator || isMycologist);

    /* ─── SWR data hooks ─── */
    // Single batch call for all dashboard counts + chart data (replaces 6 hooks)
    const { data: summaryRes } = useDashboardSummary(canLoadDashboardData);
    const summary = summaryRes?.data;

    // Derived count values from batch response
    const totalUsers = useMemo(() => {
      if (!isAdministrator || !summary?.roleCounts) return 0;
      const d = summary.roleCounts;
      return (d.farmer || 0) + (d.mycologist || 0) + (d.admin || 0);
    }, [isAdministrator, summary]);

    const totalCasesAdmin = summary?.caseCount ?? 0;
    const totalReports = summary?.reportCount ?? 0;

    // Monthly chart data (from batch)
    const chartData = useMemo(() => {
      if (!summary?.monthlyCounts || !Array.isArray(summary.monthlyCounts)) return fallbackChartData;
      return summary.monthlyCounts.map((item: any) => {
        const monthPart = (item.month || '').split(' ')[0];
        return { month: monthPart ? monthPart.slice(0, 3) : '', cases: item.total };
      });
    }, [summary]);

    // Unassigned mold reports (admin dashboard table)
    const { data: unassignedRes } = useUnassignedReports(50, isAdministrator);

    // Assigned mold reports (mycologist dashboard table)
    const { data: assignedRes } = useAssignedReports({ limit: 50 }, isMycologist);

    // Moldipedia count (from batch)
    const wikimoldCount = summary?.moldipediaCount ?? 0;

    /* ─── Derived dashboard values ─── */
    const formatReportDate = (item: any): string => {
      const fromObserved = item?.date_observed;
      const fromMetadata = item?.metadata?.created_at;
      const candidate = fromObserved ?? fromMetadata;

      if (!candidate) return 'N/A';

      let date: Date | null = null;

      if (typeof candidate === 'string') {
        const parsed = new Date(candidate);
        if (!Number.isNaN(parsed.getTime())) {
          date = parsed;
        }
      } else if (typeof candidate === 'object') {
        if (typeof candidate._seconds === 'number') {
          date = new Date(candidate._seconds * 1000);
        } else if (typeof candidate.seconds === 'number') {
          date = new Date(candidate.seconds * 1000);
        } else if (typeof candidate.toDate === 'function') {
          const converted = candidate.toDate();
          if (converted instanceof Date && !Number.isNaN(converted.getTime())) {
            date = converted;
          }
        }
      }

      if (!date || Number.isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      });
    };

    const transformCasesForTable = (snapshot: any[]) =>
      snapshot
        .filter((item: any) => (item.status || '').toLowerCase() !== 'rejected')
        .map((item: any) => {
          return {
            id: item.id,
            caseName: item.case_name || 'N/A',
            cropName: item.host || 'N/A',
            location: item.host || 'N/A',
            submittedBy: item.user_id || 'N/A',
            dateSubmitted: formatReportDate(item),
            status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending',
          };
        });

    // Admin: unassigned cases for table
    const unassignedCases = useMemo(
      () => transformCasesForTable(unassignedRes?.data?.snapshot ?? []),
      [unassignedRes],
    );

    // Mycologist: assigned cases for table + derived stats
    const assignedCases = useMemo(
      () => {
        const transformed = transformCasesForTable(assignedRes?.data?.snapshot ?? []);
        return transformed;
      },
      [assignedRes],
    );

    const totalCases = isAdministrator ? totalCasesAdmin : assignedCases.length;
    const inProgressCases = assignedCases.filter((c: any) => (c.status || '').toLowerCase() === 'in progress').length;

    const statusBreakDown = useMemo(() => {
      if (!isMycologist) return [];
      // Only show data if there are assigned cases, otherwise return empty array (shows gray circle)
      if (assignedCases.length === 0) return [];
      const ip = assignedCases.filter((c: any) => (c.status || '').toLowerCase() === 'in progress').length;
      const res = assignedCases.filter((c: any) => (c.status || '').toLowerCase() === 'resolved').length;
      return [
        { name: 'In Progress', value: ip, color: 'var(--moldify-blue)' },
        { name: 'Resolved', value: res, color: 'var(--primary-color)' },
      ];
    }, [isMycologist, assignedCases]);

    const fallbackStatusBreakDown = [
        { name: "In Progress", value: 0, color: "var(--moldify-blue)" },
        { name: "Resolved", value: 0, color: "var(--primary-color)" },
        { name: "No Data", value: 1, color: "var(--moldify-grey)", hideFromLegend: true },
    ];

    /* ─── Notification hooks ─── */
    const { data: notifRes } = useNotifications(20, undefined, !authLoading);
    const { data: unreadRes } = useUnreadNotificationCount(!authLoading);
    const notifications = notifRes?.data?.snapshot ?? [];
    const notificationCount = unreadRes?.data?.count ?? 0;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const { markRead, markAllRead, remove: removeNotification } = useNotificationMutations();

    const handleMarkRead = async (id: string) => {
      try {
        await markRead(id);
      } catch { /* swallow */ }
    };

    const handleMarkAllRead = async () => {
      try {
        await markAllRead();
      } catch { /* swallow */ }
    };

    const handleDeleteNotification = async (id: string) => {
      try {
        await removeNotification(id);
      } catch { /* swallow */ }
    };

    const fallbackProfileImage = "/assets/default-fallback.png";
    const [profileImageSrc, setProfileImageSrc] = useState(
        user?.profileImageUrl || fallbackProfileImage
    );

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <main className="relative flex flex-col xl:py-2 py-10 items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">
                        Loading dashboard...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative flex flex-col xl:py-2 py-10">
            <AuthDebug />

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onDelete={handleDeleteNotification}
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
                                {user.name || "Unknown User"}
                            </p>
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-xs">
                                {formatRole(user.role)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Header Section */}

            {/* Statistics Tiles - Role-based */}
            {isAdministrator && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
                    <StatisticsTile icon={faUsers} iconColor="var(--accent-color)" title="Total Users" statNum={totalUsers} />
                    <StatisticsTile icon={faSeedling} iconColor="var(--accent-color)" title="Total Cases" statNum={totalCases} />
                    <StatisticsTile icon={faTriangleExclamation} iconColor="var(--accent-color)" title="Total Reports" statNum={totalReports} />
                </div>
            )}

            {isMycologist && (
                <div className="flex flex-col xl:flex-row w-full mt-6 gap-x-2 gap-y-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full xl:w-2/3">
                        {/* Customize mycologist statistics here */}
                        <StatisticsTile icon={faBacterium} iconColor="var(--accent-color)" title="Total Mold Genus" statNum={6} />
                        <StatisticsTile icon={faSeedling} iconColor="var(--accent-color)" title="Total Cases" statNum={totalCases} />
                        <StatisticsTile icon={faHourglassHalf} iconColor="var(--accent-color)" title="In Progress Cases" statNum={inProgressCases} />
                        <StatisticsTile icon={faBookOpen} iconColor="var(--accent-color)" title="Total Wikimold Published" statNum={wikimoldCount} />
                    </div>
                    <div className="w-fill xl:w-1/3">
                        <DonutChart
                            title="Case Status Breakdown"
                            data={statusBreakDown.length > 0 ? statusBreakDown : fallbackStatusBreakDown}
                        />
                    </div>
                </div>
            )}
            
            {/* Monthly Cases Chart */}
            {isAdministrator && (
              <div className = "w-full my-8">
                <div className="w-full">
                  <MonthlyCasesChart data={chartData.length > 0 ? chartData : fallbackChartData} />
                </div>
                </div>
            )}

            {isMycologist && (
              <div className = "w-full my-8">
                <div className="w-full">
                  <MonthlyCasesChart data={chartData.length > 0 ? chartData : fallbackChartData} />
                </div>
                </div>
            )}            
            
            {/* Cases Chart Section */}
            <div className="mt-6 w-full">
                <h2 className="font-[family-name:var(--font-bricolage-grotesque)] font-extrabold text-[var(--primary-color)] mb-2">
                    {isAdministrator ? 'Unassigned Mold Cases' : 'Assigned Mold Cases'}
                </h2>
                <CaseTable 
                    cases={isAdministrator ? unassignedCases : assignedCases} 
                    showStatus={isMycologist}
                    showAction={true}
                    onEdit={(c: any) => {
                      const params = new URLSearchParams({ id: c.id });
                      router.push(`/investigation/view-case?${params.toString()}`);
                  }}
                />
            </div>
                        
                              
        </main>
    );
}
