"use client";
import { useState, useEffect, useRef } from 'react';
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
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';
import { getAuthToken } from '@/utils/auth';

const userRole = "Administrator";

export default function Home() {
    // Get authenticated user data from centralized auth hook
    const { user: authUser, loading: authLoading } = useAuth();
    
    // State for fetched data
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalCases, setTotalCases] = useState(0);
    const [totalReports, setTotalReports] = useState(0);
    const [totalMoldGenus, setTotalMoldGenus] = useState(0);
    const [inProgressCases, setInProgressCases] = useState(0);
    const [wikimoldCount, setWikimoldCount] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [priorityData, setPriorityData] = useState({ high: 0, medium: 0, low: 0 });
    const [cases, setCases] = useState<any[]>([]);
    const [unassignedCases, setUnassignedCases] = useState<any[]>([]);
    const [statusBreakDown, setStatusBreakDown] = useState<any[]>([]);
    
    const [loadingStats, setLoadingStats] = useState(true);
    const hasFetchedRef = useRef(false);
    
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
    
    const fallbackCases = [
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
    const isAdministrator = user.role === "admin" || user.role === "Administrator";
    const isMycologist = user.role === "mycologist" || user.role === "Mycologist";
    
    console.log('🔍 ROLE DETECTION:');
    console.log('  user.role:', user.role);
    console.log('  isAdministrator:', isAdministrator);
    console.log('  isMycologist:', isMycologist);
    console.log('  authUser?.user?.role:', authUser?.user?.role);
    console.log('  authUser?.role:', authUser?.role);

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

    const fallbackStatusBreakDown = [
        { name: "In Progress", value: 10, color: "var(--moldify-blue)" },
        { name: "Resolved", value: 30, color: "var(--primary-color)" },
    ];

    const notificationCount = notifications.length;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const fallbackProfileImage = "/assets/default-fallback.png";
    const [profileImageSrc, setProfileImageSrc] = useState(
        user?.profileImageUrl || fallbackProfileImage
    );

    const shouldFetch = (key: string, ttlMs = 60000) => {
      if (typeof window === 'undefined') return true;
      const stamp = sessionStorage.getItem(key);
      const now = Date.now();
      if (stamp && now - Number(stamp) < ttlMs) return false;
      sessionStorage.setItem(key, String(now));
      return true;
    };

    // Fetch dashboard data - MUST be before early return to follow Rules of Hooks
    useEffect(() => {
      if (authLoading) return; // Wait for auth to load
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      const fetchDashboardData = async () => {
        setLoadingStats(true);
        const token = getAuthToken();
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        try {
          // Fetch total users using role counts
          if (isAdministrator && shouldFetch('dash:users-count')) {
            console.log('📊 Fetching total users...');
            try {
              const rolesRes = await fetch('/api/v1/users/counts/roles', { cache: 'default' });
              console.log('📊 Users role counts response status:', rolesRes.status);
              if (rolesRes.ok) {
                const rolesData = await rolesRes.json();
                console.log('📊 Users role counts received:', rolesData);
                if (rolesData.success && rolesData.data) {
                  const totalCount = (rolesData.data.farmer || 0) + (rolesData.data.mycologist || 0) + (rolesData.data.admin || 0);
                  console.log('📊 Setting totalUsers to:', totalCount);
                  setTotalUsers(totalCount);
                } else {
                  console.log('📊 Unexpected users data structure:', rolesData);
                }
              } else {
                console.error('📊 Users fetch failed with status:', rolesRes.status);
              }
            } catch (err) {
              console.error('📊 Failed to fetch total users:', err);
            }
          } else {
            console.log('📊 Not an administrator, skipping user fetch');
          }

          // Fetch total cases using status counts (admin only)
          if (isAdministrator && shouldFetch('dash:cases-count')) {
            try {
              const casesCountRes = await fetch('/api/v1/mold-reports/count/status', { cache: 'default' });
              if (casesCountRes.ok) {
                const casesCountData = await casesCountRes.json();
                if (casesCountData.success && casesCountData.data) {
                  const totalCaseCount = casesCountData.data.total;
                  setTotalCases(totalCaseCount);
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch total cases:', err);
            }
          }

          // Fetch total reports (admin only)
          if (isAdministrator && shouldFetch('dash:reports-count')) {
            try {
              const reportsRes = await fetch('/api/v1/reports?limit=1000', { cache: 'default' });
              if (reportsRes.ok) {
                const reportsData = await reportsRes.json();
                if (reportsData.success && reportsData.data?.snapshot) {
                  const totalReportCount = reportsData.data?.snapshot?.length || 0;
                  setTotalReports(totalReportCount);
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch total reports:', err);
            }
          }

          // Fetch case data for table (admin only fallback list)
          if (isAdministrator && shouldFetch('dash:cases-list')) {
            try {
              const casesRes = await fetch(`/api/v1/mold-reports?limit=10`, { cache: 'default' });
              if (casesRes.ok) {
                const casesData = await casesRes.json();
                if (casesData.data && Array.isArray(casesData.data.snapshot)) {
                  setCases(casesData.data.snapshot);
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch case data:', err);
            }
          }

          // Fetch unassigned cases for admin dashboard or assigned cases for mycologist dashboard
          console.log('\n🟢🟢🟢 STARTING CASES FETCH 🟢🟢🟢');
          console.log('📊 isAdministrator:', isAdministrator, 'isMycologist:', isMycologist, 'user.role:', user.role);
          
          // Clear previous data to avoid confusion
          setUnassignedCases([]);
          
          if (isAdministrator) {
            console.log('\n🔴 ADMIN BRANCH EXECUTING');
            console.log('🔴🔴🔴 FETCHING FROM: /api/v1/mold-reports/unassigned 🔴🔴🔴');
            try {
              // Only fetch first page to reduce requests
              if (shouldFetch('dash:unassigned-cases')) {
                const url = '/api/v1/mold-reports/unassigned?limit=50';
                const unassignedRes = await fetch(url, { cache: 'no-store' });
                
                if (unassignedRes.ok) {
                  const unassignedData = await unassignedRes.json();
                  if (unassignedData.data?.snapshot) {
                    const transformedCases = unassignedData.data.snapshot.map((item: any) => {
                      const timestamp = item.date_observed?._seconds 
                        ? new Date(item.date_observed._seconds * 1000).toISOString().split('T')[0]
                        : 'N/A';
                      
                      return {
                        id: item.id,
                        caseName: item.case_name || 'N/A',
                        cropName: item.host || 'N/A',
                        location: item.host || 'N/A',
                        submittedBy: item.user_id || 'N/A',
                        dateSubmitted: timestamp,
                        priority: item.priority || item.case_priority || 'N/A',
                        status: item.status || 'pending',
                      };
                    });
                    
                    setUnassignedCases(transformedCases);
                  }
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch unassigned cases:', err);
            }
          } else if (isMycologist) {
            console.log('\n🔵 MYCOLOGIST BRANCH EXECUTING');
            console.log('🔵🔵🔵 FETCHING FROM: /api/v1/mold-reports/assigned 🔵🔵🔵');
            try {
              // Only fetch first page to reduce requests
              if (shouldFetch('dash:assigned-cases')) {
                const url = '/api/v1/mold-reports/assigned?limit=50';
                const assignedRes = await fetch(url, { cache: 'no-store' });
                
                if (assignedRes.ok) {
                  const assignedData = await assignedRes.json();
                  if (assignedData.data?.snapshot) {
                    const transformedCases = assignedData.data.snapshot.map((item: any) => {
                      const timestamp = item.date_observed?._seconds 
                        ? new Date(item.date_observed._seconds * 1000).toISOString().split('T')[0]
                        : 'N/A';
                      
                      return {
                        id: item.id,
                        caseName: item.case_name || 'N/A',
                        cropName: item.host || 'N/A',
                        location: item.host || 'N/A',
                        submittedBy: item.user_id || 'N/A',
                        dateSubmitted: timestamp,
                        priority: item.priority || item.case_priority || 'N/A',
                        status: item.status || 'pending',
                      };
                    });
                    
                    const inProgressCount = assignedData.data.snapshot.filter(
                      (item: any) => (item.status || '').toLowerCase() === 'in progress'
                    ).length;
                    const resolvedCount = assignedData.data.snapshot.filter(
                      (item: any) => (item.status || '').toLowerCase() === 'resolved'
                    ).length;
                    setUnassignedCases(transformedCases);
                    setTotalCases(transformedCases.length);
                    setInProgressCases(inProgressCount);
                    setStatusBreakDown([
                      { name: 'In Progress', value: inProgressCount, color: 'var(--moldify-blue)' },
                      { name: 'Resolved', value: resolvedCount, color: 'var(--primary-color)' },
                    ]);
                  }
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch assigned cases:', err);
            }
          } else {
            console.log('\n❌ NO VALID ROLE DETECTED');
            console.log('❌ User role not recognized - neither admin nor mycologist');
          }

          // Fetch wikimold count (admin only to reduce requests)
          if (isAdministrator) {
            try {
              if (shouldFetch('dash:moldipedia')) {
                const moldRes = await fetch(`${envOptions.apiUrl}${endpoints.moldipedia.list}`, { headers });
                if (moldRes.ok) {
                  const moldData = await moldRes.json();
                  if (Array.isArray(moldData.data)) {
                    setWikimoldCount(moldData.data.length);
                  }
                }
              }
            } catch (err) {
              console.error('Failed to fetch wikimold count:', err);
            }
          }

          // Fetch dashboard statistics (monthly totals)
          if (isAdministrator || isMycologist) {
            try {
              if (shouldFetch('dash:monthly')) {
                const monthlyRes = await fetch('/api/v1/mold-reports/count/monthly', { cache: 'default' });
                console.log('📊 Monthly totals response status:', monthlyRes.status);
                if (monthlyRes.ok) {
                  const monthlyData = await monthlyRes.json();
                  console.log('📊 Monthly totals received:', monthlyData);
                  if (monthlyData.success && Array.isArray(monthlyData.data)) {
                    // Transform the data for the chart
                    const chartData = monthlyData.data.map((item: any) => {
                      // Extract month name from "January 2025" format
                      const monthPart = item.month.split(' ')[0];
                      return {
                        month: monthPart,
                        cases: item.total
                      };
                    });
                    console.log('📊 Setting chart data:', chartData);
                    setChartData(chartData);
                  } else {
                    setChartData(fallbackChartData);
                  }
                } else {
                  setChartData(fallbackChartData);
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch monthly totals:', err);
              setChartData(fallbackChartData);
            }
          }

          // Fetch priority breakdown (admin only to reduce requests)
          if (isAdministrator && shouldFetch('dash:priority')) {
            try {
              const priorityRes = await fetch('/api/v1/mold-reports/count/priorities', { cache: 'default' });
              if (priorityRes.ok) {
                const priorityData = await priorityRes.json();
                if (priorityData.success && priorityData.data) {
                  setPriorityData(priorityData.data);
                }
              }
            } catch (err) {
              console.error('📊 Failed to fetch priority breakdown:', err);
            }
          }

        } finally {
          setLoadingStats(false);
        }
      };

      fetchDashboardData();
    }, [authLoading]);

    // Remove separate priority fetch - now consolidated in main useEffect

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

    // Debug: log the auth user data
    console.log('📊 Dashboard - Auth user:', authUser);
    console.log('📊 Dashboard - Mapped user:', user);


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
            
            {/* Line Chart & Priority Level Breakdown */}
            <div className = "w-full my-8 flex flex-col lg:flex-row gap-x-10 gap-y-10">
                <div className="w-full lg:w-2/3">
                    <MonthlyCasesChart data={chartData.length > 0 ? chartData : fallbackChartData} />
                </div>
                <div className="w-full lg:w-1/3">
                    <PriorityBreakdown data={priorityData} />
                </div>
            </div>            
            
            {/* Line Chart & Priority Level Breakdown */}
            <div className="mt-6 w-full">
                <h2 className="font-[family-name:var(--font-bricolage-grotesque)] font-extrabold text-[var(--primary-color)] mb-2">
                    {isAdministrator ? 'Unassigned Mold Cases' : 'Assigned Mold Cases'}
                </h2>
                <CaseTable 
                    cases={unassignedCases.length > 0 ? unassignedCases : (isAdministrator ? [] : cases)} 
                    showPriority={isMycologist}
                    showStatus={false}
                    showAction={false}
                    onEdit={(c: any) => {
                      window.location.href = '/investigation/view-case';
                  }}
                />
            </div>
                        
                              
        </main>
    );
}
