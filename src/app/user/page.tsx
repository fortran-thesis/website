"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import DonutChart from '@/components/charts/donut-chart';
import UserTable from '@/components/tables/user_table';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';


export default function Users() {

    const userRole = "Administrator";
    const router = useRouter();

    // UI state
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Stats from API endpoints
    const [roleCounts, setRoleCounts] = useState({ farmer: 0, mycologist: 0, admin: 0 });
    const [disabledCounts, setDisabledCounts] = useState({ active: 0, inactive: 0 });

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

    // Client-side filter function
    const getFilteredUsers = () => {
        return users.filter(user => {
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
    };

    const filteredUsers = getFilteredUsers();

    // Fetch initial users and stats on mount
    useEffect(() => {
        let mounted = true;
        
        const fetchCountsAndUsers = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch role and disabled counts
                const [rolesRes, disabledRes, usersRes] = await Promise.all([
                    fetch('/api/v1/users/counts/roles', { cache: 'default' }),
                    fetch('/api/v1/users/counts/disabled', { cache: 'default' }),
                    fetch('/api/v1/users?limit=100', { cache: 'no-store' })
                ]);
                
                if (mounted) {
                    if (rolesRes.ok) {
                        const rolesBody = await rolesRes.json();
                        if (rolesBody.success && rolesBody.data) setRoleCounts(rolesBody.data);
                    }
                    if (disabledRes.ok) {
                        const disabledBody = await disabledRes.json();
                        if (disabledBody.success && disabledBody.data) setDisabledCounts(disabledBody.data);
                    }
                    if (usersRes.ok) {
                        const usersBody = await usersRes.json();
                        const data = Array.isArray(usersBody.data?.snapshot) ? usersBody.data.snapshot : [];
                        setUsers(data);
                        setNextPageToken(usersBody.data?.nextPageToken || null);
                    } else {
                        const errorBody = await usersRes.json().catch(() => ({}));
                        throw new Error(errorBody?.error || 'Failed to load users');
                    }
                }
            } catch (e: any) {
                console.error('Failed to load data:', e);
                if (mounted) setError(e?.message || 'Failed to load data');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        
        fetchCountsAndUsers();
        
        return () => {
            mounted = false;
        };
    }, []);

    // Infinite scroll - load more users without filters
    useEffect(() => {
        if (!nextPageToken || isLoadingMore) return;

        const handleLoadMore = async () => {
            setIsLoadingMore(true);
            try {
                const params = new URLSearchParams();
                params.set('limit', '100');
                params.set('pageToken', nextPageToken);
                const url = `/api/v1/users?${params.toString()}`;
                
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.error || 'Failed to load more users');
                }
                const body = await res.json();
                const newData = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];

                // Stop pagination if no new data
                if (newData.length === 0) {
                    console.warn('⚠️ No more users returned - stopping pagination');
                    setNextPageToken(null);
                    setIsLoadingMore(false);
                    return;
                }

                // Safety check: if token didn't change, stop loading
                const newToken = body.data?.nextPageToken || null;
                if (!newToken || newToken === nextPageToken) {
                    console.warn('⚠️ Backend returned same token - stopping pagination');
                    setNextPageToken(null);
                    setIsLoadingMore(false);
                    return;
                }

                setUsers(prev => [...prev, ...newData]);
                setNextPageToken(newToken);
            } catch (err) {
                console.error('Failed to load more users:', err);
            } finally {
                setIsLoadingMore(false);
            }
        };

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
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
    }, [nextPageToken, isLoadingMore]);

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
                            setNextPageToken(null); // Reset pagination
                        }}
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Filter by Role */}
                    <label htmlFor="role" className="sr-only">Filter by Role</label>
                    <select
                        id="role"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setNextPageToken(null); // Reset pagination
                        }}
                        className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full md:w-auto"
                    >
                        <option value="" className="bg-[var(--taupe)] font-bold text-[var(--primary-color)]">
                            Filter By Role
                        </option>
                        <option value="all" className="bg-[var(--taupe)]">All</option>
                        <option value="farmer" className="bg-[var(--taupe)]">Farmer</option>
                        <option value="mycologist" className="bg-[var(--taupe)]">Mycologist</option>
                        <option value="admin" className="bg-[var(--taupe)]">Admin</option>
                    </select>

                    {/* Filter by Status */}
                    <label htmlFor="status" className="sr-only">Filter by Status</label>
                    <select
                        id="status"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setNextPageToken(null); // Reset pagination
                        }}
                        className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full md:w-auto"
                    >
                        <option value="" className="bg-[var(--taupe)] font-bold text-[var(--primary-color)]">
                            Filter By Status
                        </option>
                        <option value="all" className="bg-[var(--taupe)]">All</option>
                        <option value="active" className="bg-[var(--taupe)]">Active</option>
                        <option value="disabled" className="bg-[var(--taupe)]">Disabled</option>
                    </select>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-5 w-full">
                {loading && <p>Loading users...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && <UserTable data={filteredUsers} 
                    onEdit={(c: any) => {
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
