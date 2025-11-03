"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboard, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import DonutChart from '@/components/charts/donut-chart';
import UserTable from '@/components/tables/user_table';
import { useState, useEffect, useRef } from 'react';
import AddMycoModal, { MycoFormData } from '@/components/modals/create_myco_acc_modal';


export default function Users() {

    const userRole = "Administrator";

    // UI state
    const [users, setUsers] = useState<any[]>([]);
    const [isAddMycoModal, setShowAddMycoModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

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

    // Fetch initial users page (no pagination for now)
    useEffect(() => {
        // Fetch role and disabled counts
        const fetchCounts = async () => {
            try {
                const [rolesRes, disabledRes] = await Promise.all([
                    fetch('/api/v1/users/counts/roles', { cache: 'no-store' }),
                    fetch('/api/v1/users/counts/disabled', { cache: 'no-store' })
                ]);
                if (rolesRes.ok) {
                    const rolesBody = await rolesRes.json();
                    if (rolesBody.success && rolesBody.data) setRoleCounts(rolesBody.data);
                }
                if (disabledRes.ok) {
                    const disabledBody = await disabledRes.json();
                    if (disabledBody.success && disabledBody.data) setDisabledCounts(disabledBody.data);
                }
            } catch (err) {
                // Optionally handle error
            }
        };
        fetchCounts();
        let mounted = true;
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/v1/users?limit=10', { cache: 'no-store' });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.error || 'Failed to load users');
                }
                const body = await res.json();
                console.log(body);
                const data = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                if (mounted) {
                    setUsers(data);
                    setNextPageToken(body.data?.nextPageToken || null);
                }
            } catch (e: any) {
                console.error('Failed to load users', e);
                if (mounted) setError(e?.message || 'Failed to load users');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchUsers();
        return () => { mounted = false; };
    }, []);

    const handleMycoSubmit = async (data: MycoFormData) => {
        console.log('Form submitted:', data);

        // Refresh users list and counts (reset pagination)
        try {
            const [rolesRes, disabledRes] = await Promise.all([
                fetch('/api/v1/users/counts/roles', { cache: 'no-store' }),
                fetch('/api/v1/users/counts/disabled', { cache: 'no-store' })
            ]);
            if (rolesRes.ok) {
                const rolesBody = await rolesRes.json();
                if (rolesBody.success && rolesBody.data) setRoleCounts(rolesBody.data);
            }
            if (disabledRes.ok) {
                const disabledBody = await disabledRes.json();
                if (disabledBody.success && disabledBody.data) setDisabledCounts(disabledBody.data);
            }

            // Refresh users list and reset pagination
            const usersRes = await fetch('/api/v1/users?limit=10', { cache: 'no-store' });
            if (usersRes.ok) {
                const usersBody = await usersRes.json();
                const usersData = Array.isArray(usersBody.data?.snapshot) ? usersBody.data.snapshot : [];
                console.log('Updated users list:', usersData);
                setUsers(usersData);
                setNextPageToken(usersBody.data?.nextPageToken || null);
            } else {
                console.error('Failed to fetch users:', usersRes.status);
            }
        } catch (err) {
            console.error('Failed to refresh data:', err);
        }
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!nextPageToken || isLoadingMore) return;

        const handleLoadMore = async () => {
            setIsLoadingMore(true);
            try {
                const res = await fetch(`/api/v1/users?limit=10&pageToken=${nextPageToken}`, { cache: 'no-store' });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.error || 'Failed to load more users');
                }
                const body = await res.json();
                const newData = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];

                // Safety check: if token didn't change and we got data, stop loading
                const newToken = body.data?.nextPageToken || null;
                if (newToken === nextPageToken && newData.length > 0) {
                    console.warn('⚠️ Backend returned same token - stopping pagination');
                    setNextPageToken(null); // Stop pagination
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
                        INVESTIGATION OVERSIGHT
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
                    onClick={() => setShowAddMycoModal(true)}
                >
                    <span>Create Mycologist Account</span>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
            <div className="flex flex-col mt-5 md:flex-row md:ml-auto gap-x-2 gap-y-3 w-full">
                {/* Search Bar */}
                <div className="relative flex items-center w-full">
                    <label htmlFor="search" className="sr-only">Search Cases</label>
                    <input
                        id="search"
                        placeholder="Search Cases"
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                        required
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Filter by Priority */}
                    <label htmlFor="priority" className="sr-only">Filter by Priority</label>
                    <select
                        id="priority"
                        className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full md:w-auto"
                        defaultValue=""
                    >
                        <option value="" className="bg-[var(--taupe)]" disabled>
                            Filter By Priority
                        </option>
                        <option value="low" className="bg-[var(--taupe)]">Low Priority</option>
                        <option value="medium" className="bg-[var(--taupe)]">Medium Priority</option>
                        <option value="high" className="bg-[var(--taupe)]">High Priority</option>
                    </select>

                    {/* Filter by Status */}
                    <label htmlFor="status" className="sr-only">Filter by Status</label>
                    <select
                        id="status"
                        className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full md:w-auto"
                        defaultValue=""
                    >
                        <option value="" className="bg-[var(--taupe)]" disabled>
                            Filter By Status
                        </option>
                        <option value="in-progress" className="bg-[var(--taupe)]">In Progress</option>
                        <option value="resolved" className="bg-[var(--taupe)]">Resolved</option>
                        <option value="closed" className="bg-[var(--taupe)]">Closed</option>
                        <option value="pending" className="bg-[var(--taupe)]">Pending</option>
                    </select>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-6 w-full">
                {loading && <p>Loading users...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && <UserTable data={users} />}

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-4 text-center">
                    {isLoadingMore && <p className="text-sm text-[var(--moldify-grey)]">Loading more users...</p>}
                </div>
            </div>

            <AddMycoModal
                isOpen={isAddMycoModal}
                onClose={() => setShowAddMycoModal(false)}
                onSubmit={handleMycoSubmit}
            />
        </main>
    );
}
