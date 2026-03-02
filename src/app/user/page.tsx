"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';
import StatusDropdown from '@/components/StatusDropdown';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import DonutChart from '@/components/charts/donut-chart';
import UserTable from '@/components/tables/user_table';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRoleCounts, useUserDisabledCounts, useUsersInfinite } from '@/hooks/swr';


export default function Users() {

    const userRole = "Administrator";
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // SWR: counts
    const { data: rolesData } = useUserRoleCounts();
    const { data: disabledData } = useUserDisabledCounts();

    const roleCounts = (rolesData as any)?.data ?? { farmer: 0, mycologist: 0, admin: 0 };
    const disabledCounts = (disabledData as any)?.data ?? { active: 0, inactive: 0 };

    const totalUsers = roleCounts.farmer + roleCounts.mycologist + roleCounts.admin;
    const totalFarmers = roleCounts.farmer;
    const totalMycologists = roleCounts.mycologist;
    const totalAdmins = roleCounts.admin;

    const inactiveCount = disabledCounts.inactive;
    const activeCount = disabledCounts.active;
    const userStatusData = [
        { name: "Inactive", value: inactiveCount, color: "var(--moldify-red)" },
        { name: "Active", value: activeCount, color: "var(--primary-color)" },
    ];

    // SWR: paginated users
    const {
      data: usersPages,
      size,
      setSize,
      isLoading: loading,
      isValidating: isLoadingMore,
    } = useUsersInfinite(100);

    const users = useMemo(
      () => usersPages?.flatMap((p: any) => p.data?.snapshot ?? []) ?? [],
      [usersPages],
    );
    const hasMore = usersPages?.[usersPages.length - 1]?.data?.nextPageToken;
    const error: string | null = null;

    // Client-side filter function
    const filteredUsers = useMemo(() => {
        return users.filter((user: any) => {
            const searchLower = searchQuery.toLowerCase();
            const roleValue = (user.user?.role || '').toLowerCase();
            const normalizedRole = roleValue === 'user'
                ? 'farmer'
                : roleValue === 'administrator'
                ? 'admin'
                : roleValue;

            const fullName = `${user.user?.first_name ?? ''} ${user.user?.last_name ?? ''}`.trim();
            const matchesSearch = !searchQuery ||
                fullName.toLowerCase().includes(searchLower) ||
                user.user?.username?.toLowerCase().includes(searchLower) ||
                user.details?.displayName?.toLowerCase().includes(searchLower) ||
                user.details?.email?.toLowerCase().includes(searchLower);

            const matchesRole = !roleFilter || roleFilter === 'all' || normalizedRole === roleFilter;

            const isDisabled = user.details?.disabled === true;
            const matchesStatus = !statusFilter || statusFilter === 'all' ||
                (statusFilter === 'active' && !isDisabled) ||
                (statusFilter === 'disabled' && isDisabled);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Infinite scroll via IntersectionObserver → load next SWR page
    useEffect(() => {
        if (!hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setSize(s => s + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [hasMore, isLoadingMore, setSize]);

    return (
        <main className="relative flex flex-col xl:py-2 py-10 w-full">

            {/* Header Section */}
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <Breadcrumbs role={userRole} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        USER MANAGEMENT
                    </h1>
                </div>

            </div>
            {/* End Header Section */}

            {/* Statistics Tiles */}
            <div className="flex flex-col xl:flex-row w-full mt-6 gap-x-2 gap-y-2">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full xl:w-2/3">
                    <StatisticsTile icon={faUsers} iconColor="var(--accent-color)" title="Total Users" statNum={totalUsers} />
                    <StatisticsTile icon={faUsers} iconColor="var(--primary-color)" title="Total Farmers" statNum={totalFarmers} />
                    <StatisticsTile icon={faUsers} iconColor="var(--moldify-blue)" title="Total Mycologists" statNum={totalMycologists} />
                    <StatisticsTile icon={faUsers} iconColor="var(--moldify-red)" title="Total Administrators" statNum={totalAdmins} />
                </div>
                <div className="w-fill xl:w-1/3">
                    <DonutChart
                        title="User Status Breakdown"
                        data={userStatusData}
                    />
                </div>
            </div>


            {/* Submitted Cases Section */}
            <div className="flex flex-col md:flex-row md:items-center mt-10 gap-4 w-full justify-between">
                {/* Left Label */}
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
                    User Accounts
                </p>

                {/* Right Section */}
                <button
                    className="flex items-center justify-center gap-2 font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--hover-primary)] transition-colors cursor-pointer text-sm"
                    onClick={() => router.push('/user/create-mycologist')}
                >
                    <span>Create Mycologist Account</span>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
            <div className="flex flex-col mt-2 md:flex-row md:ml-auto gap-x-2 gap-y-3 w-full">
                {/* Search Bar */}
                <div className="relative flex items-center w-full">
                    <label htmlFor="search" className="sr-only">Search Users</label>
                    <input
                        id="search"
                        placeholder="Search Users"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Custom Role Dropdown */}
                    <StatusDropdown
                        placeholder="Filter By Role"
                        backgroundColor="var(--accent-color)"
                        textColor="var(--moldify-black)"
                        options={[
                            { label: "All", value: "all" },
                            { label: "Farmer", value: "farmer" },
                            { label: "Mycologist", value: "mycologist" },
                            { label: "Admin", value: "admin" }
                        ]}
                        onSelect={(value) => {
                            setRoleFilter(value);
                        }}
                    />

                    {/* Custom Status Dropdown */}
                    <StatusDropdown
                        placeholder="Filter By Status"
                        backgroundColor="var(--accent-color)"
                        textColor="var(--moldify-black)"
                        options={[
                            { label: "All", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Disabled", value: "disabled" }
                        ]}
                        onSelect={(value) => {
                            setStatusFilter(value);
                        }}
                    />
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-5 w-full">
                {loading && <p className="text-center text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl mt-10">Loading users...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && <UserTable data={filteredUsers} 
                    onEdit={(c: any) => {
                      console.log('📋 UserTable edit clicked:', { user: c, userId: c?.id });
                      if (!c?.id) {
                        console.error('❌ User has no id:', c);
                        return;
                      }
                      window.location.href = `/user/view-user?id=${c.id}`;
                  }}/>}

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-4 text-center">
                    {isLoadingMore && <p className="text-sm text-[var(--moldify-grey)]">Loading more users...</p>}
                </div>
            </div>
        </main>
    );
}
