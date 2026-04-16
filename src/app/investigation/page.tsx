"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSeedling, faClockRotateLeft, faHourglassHalf, faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import StatusDropdown from '@/components/StatusDropdown';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from '@/hooks/swr/types';
import type { MoldReportSnapshot, StatusCounts } from '@/hooks/swr/use-mold-reports';
import PageLoading from '@/components/loading/page_loading';

export default function Investigation() {
        const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
        
        // Map auth user data  
        const user = authUser ? {
            name: (authUser.user?.first_name && authUser.user?.last_name) 
                ? `${authUser.user.first_name} ${authUser.user.last_name}`
                : authUser.user?.username || authUser.name || "Guest User",
            role: authUser.user?.role || authUser.role || "admin"
        } : {
            name: "Guest User",
            role: "admin"
        };

        // Determine user role
        const isAdministrator = user.role === "admin" || user.role === "Administrator";
        const isMycologist = user.role === "mycologist" || user.role === "Mycologist";
        const userRole = user.role === "admin" ? "Administrator" : user.role === "mycologist" ? "Mycologist" : "User";
    
        /* ── SWR: admin status counts (only fetched for admin role) ── */
        const { data: adminStatsRes } = useSWR<ApiResponse<StatusCounts>>(
            isAdministrator ? '/api/v1/mold-reports/count/status' : null,
        );

        /* ── SWR: paginated cases (role-aware endpoint) ── */
        const {
            data: casePagesData,
            size,
            setSize,
            isValidating: isLoadingMore,
            isLoading: casesLoading,
        } = useSWRInfinite<ApiResponse<PaginatedResponse<MoldReportSnapshot>>>(
            (pageIndex, prev) => {
                if (authLoading) return null;
                if (prev && !prev.data?.nextPageToken) return null;
                const scope = isAdministrator ? 'all' : 'assigned';
                if (pageIndex === 0) return apiUrl('/api/v1/mold-reports', { limit: 100, scope });
                return apiUrl('/api/v1/mold-reports', { limit: 100, scope, pageToken: prev!.data!.nextPageToken! });
            },
            { revalidateFirstPage: false },
        );

        /* Load More is triggered manually — no eager auto-expand. */

        const normalizeDisplayStatus = (status?: string) => {
            const raw = (status ?? '').trim().toLowerCase();
            if (raw === 'pending' || raw === 'pending review' || raw === 'for approval') return 'Pending';
            if (raw === 'in progress') return 'In Progress';
            if (raw === 'resolved') return 'Resolved';
            if (raw === 'rejected') return 'Rejected';
            return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
        };

        /* ── Map report snapshot → display row ── */
        const mapReportToCase = (it: MoldReportSnapshot) => {
            let dateSubmittedISO = '';
            const createdSeconds = it.metadata?.created_at?._seconds;
            if (createdSeconds) {
                dateSubmittedISO = new Date(createdSeconds * 1000).toISOString();
            } else if (typeof it.date_observed === 'string') {
                dateSubmittedISO = it.date_observed;
            }
            const dateSubmitted = dateSubmittedISO
                ? new Date(dateSubmittedISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
                : '';
            const description = Array.isArray(it.case_details) && it.case_details[0]?.description
                ? it.case_details[0].description : '';
            const location = it.mold_case?.location || it.location || it.reporter?.address || 'N/A';
            const submittedBy = it.reporter?.name || 'N/A';

            return {
                id: it.id,
                caseName: it.case_name || '',
                cropName: it.host || '',
                location,
                submittedBy,
                dateSubmitted,
                dateSubmittedISO,
                status: normalizeDisplayStatus(it.status),
                description,
            };
        };

        /* ── Flatten paginated SWR data into a single cases array ── */
        const cases = useMemo(() => {
            if (!casePagesData) return [];
            return casePagesData.flatMap(page =>
                (page?.data?.snapshot ?? []).map(mapReportToCase),
            );
        }, [casePagesData]);

        /* ── Derive stats (admin: from API, mycologist: from cases) ── */
        const caseStats = useMemo(() => {
            if (isAdministrator && adminStatsRes?.data) return adminStatsRes.data;
            return cases.reduce(
                (acc, c) => {
                    const s = c.status?.toLowerCase() || 'pending';
                    if (s === 'pending' || s === 'for approval') acc.pending++;
                    else if (s === 'in progress') acc.in_progress++;
                    else if (s === 'resolved') acc.resolved++;
                    else if (s === 'rejected') acc.rejected++;
                    acc.total++;
                    return acc;
                },
                { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 },
            );
        }, [isAdministrator, adminStatsRes, cases]);

        /* ── Search & filter state ── */
        const [searchQuery, setSearchQuery] = useState('');
        const [statusFilter, setStatusFilter] = useState('');
        const [dateOrder, setDateOrder] = useState<'newest' | 'oldest'>('newest');
        const [sortKey, setSortKey] = useState<'caseName' | 'cropName' | 'location' | 'submittedBy' | 'dateSubmitted' | 'status' | null>(null);
        const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

        const handleSort = (column: 'caseName' | 'cropName' | 'location' | 'submittedBy' | 'dateSubmitted' | 'status') => {
            if (sortKey !== column) {
                setSortKey(column);
                setSortDirection('asc');
                return;
            }

            if (sortDirection === 'asc') {
                setSortDirection('desc');
                return;
            }

            // Third click restores default sort (latest to oldest).
            setSortKey(null);
            setSortDirection('asc');
        };

        const filteredCases = useMemo(() => {
            const filtered = cases.filter((c) => {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch = !searchQuery ||
                    c.caseName?.toLowerCase().includes(searchLower) ||
                    c.cropName?.toLowerCase().includes(searchLower) ||
                    c.location?.toLowerCase().includes(searchLower) ||
                    c.submittedBy?.toLowerCase().includes(searchLower) ||
                    c.description?.toLowerCase().includes(searchLower) ||
                    c.status?.toLowerCase().includes(searchLower);
                const matchesStatus = !statusFilter || statusFilter === 'all' || c.status?.toLowerCase() === statusFilter;
                return matchesSearch && matchesStatus;
            });

            if (!sortKey) {
                // Date order filter (client-side): newest first or oldest first.
                return filtered.sort((a, b) => {
                    const da = a.dateSubmittedISO ? new Date(a.dateSubmittedISO).getTime() : 0;
                    const db = b.dateSubmittedISO ? new Date(b.dateSubmittedISO).getTime() : 0;
                    return dateOrder === 'newest' ? db - da : da - db;
                });
            }

            return filtered.sort((a, b) => {
                if (sortKey === 'dateSubmitted') {
                    const da = a.dateSubmittedISO ? new Date(a.dateSubmittedISO).getTime() : 0;
                    const db = b.dateSubmittedISO ? new Date(b.dateSubmittedISO).getTime() : 0;
                    return sortDirection === 'asc' ? da - db : db - da;
                }

                const av = (a[sortKey] ?? '').toString();
                const bv = (b[sortKey] ?? '').toString();
                const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
                return sortDirection === 'asc' ? cmp : -cmp;
            });
        }, [cases, searchQuery, statusFilter, dateOrder, sortKey, sortDirection]);

        /* ── Derived loading / has-more flags ── */
        const loading = authLoading || casesLoading;
        const hasMore = !!casePagesData?.[casePagesData.length - 1]?.data?.nextPageToken;

    return (
        <main className="relative flex flex-col xl:py-2 py-10 w-full">

            {/* Header Section */}
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <Breadcrumbs role={userRole} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        CASE MANAGEMENT
                    </h1>
                </div>

            </div>
            {/* End Header Section */}
            
            {/* Statistics Tiles */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 mt-6 ${isMycologist ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
                <StatisticsTile icon={faSeedling} iconColor="var(--moldify-black)" title="Total Cases" statNum={caseStats.total} />
                {!isMycologist && (
                    <StatisticsTile icon={faClockRotateLeft} iconColor="var(--accent-color)" title="Pending Cases" statNum={caseStats.pending} />
                )}
                <StatisticsTile icon={faHourglassHalf} iconColor="var(--moldify-blue)" title="In Progress Mold Cases" statNum={caseStats.in_progress} />
                <StatisticsTile icon={faCircleCheck} iconColor="var(--primary-color)" title="Resolved Mold Cases" statNum={caseStats.resolved} />
            </div>
            
            {/* Submitted Cases Section */}
            <div className="flex flex-col lg:flex-row lg:items-center mt-10 gap-4 w-full">
                {/* Left Label */}
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
                    Submitted Cases
                </p>

                {/* Right Section */}
                <div className="flex flex-col lg:flex-row lg:ml-auto gap-x-2 gap-y-3 w-full lg:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex items-center w-full lg:w-100">
                        <label htmlFor="search" className="sr-only">Search Cases</label>
                        <input
                            id="search"
                            placeholder="Search Cases"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                            }}
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 w-full lg:w-auto">
                        {/* Filter by Status */}
                        <div className="w-full lg:w-auto">
                            <StatusDropdown
                                placeholder="Filter By Status"
                                backgroundColor="var(--accent-color)"
                                textColor="var(--moldify-black)"
                                options={
                                    isMycologist
                                        ? [
                                            { label: "All", value: "all" },
                                            { label: "Pending", value: "pending" },
                                            { label: "In Progress", value: "in progress" },
                                            { label: "Resolved", value: "resolved" },
                                            { label: "Rejected", value: "rejected" }
                                        ]
                                        : [
                                            { label: "All", value: "all" },
                                            { label: "Pending", value: "pending" },
                                            { label: "In Progress", value: "in progress" },
                                            { label: "Resolved", value: "resolved" },
                                            { label: "Rejected", value: "rejected"}
                                        ]
                                }
                                onSelect={(value) => setStatusFilter(value)}
                            />
                        </div>

                        {/* Filter by Date Order (client-side) */}
                        <div className="w-full lg:w-auto">
                            <StatusDropdown
                                placeholder="Filter By Date"
                                backgroundColor="var(--primary-color)"
                                textColor="var(--background-color)"
                                options={[
                                    { label: "Newest First", value: "newest" },
                                    { label: "Oldest First", value: "oldest" },
                                ]}
                                onSelect={(value) => setDateOrder(value === 'oldest' ? 'oldest' : 'newest')}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="w-full">
                {loading && <PageLoading message="Loading cases..." />}
                {!loading && (
                    <>
                        <CaseTable
                            cases={filteredCases}
                            showAction={true}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                            onEdit={(c: any) => {
                                const params = new URLSearchParams({ id: c.id });
                                router.push(`/investigation/view-case?${params.toString()}`);
                            }}
                        />
                        {/* Load More */}
                        {isLoadingMore && (
                            <div className="py-4 text-center">
                                <PageLoading message="Loading more cases..." compact />
                            </div>
                        )}
                        {!isLoadingMore && hasMore && (
                            <div className="py-6 flex justify-center">
                                <button
                                    onClick={() => setSize(s => s + 1)}
                                    className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-sm uppercase tracking-widest px-8 py-3 rounded-full border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--background-color)] transition-colors"
                                >
                                    Load More Cases
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
        </main>
    );
}
