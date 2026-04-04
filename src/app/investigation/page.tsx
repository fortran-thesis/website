"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSeedling, faClockRotateLeft, faHourglassHalf, faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import StatusDropdown from '@/components/StatusDropdown';
import { useState, useEffect, useMemo } from 'react';
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

        /* Auto-expand remaining pages so all data loads eagerly */
        useEffect(() => {
            if (!casePagesData || isLoadingMore) return;
            const lastPage = casePagesData[casePagesData.length - 1];
            if (lastPage?.data?.nextPageToken) {
                setSize(s => s + 1);
            }
        }, [casePagesData, isLoadingMore, setSize]);

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
                status: it.status
                    ? it.status.charAt(0).toUpperCase() + it.status.slice(1)
                    : 'Pending',
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
                    if (s === 'pending') acc.pending++;
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
        const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

            // Sort by date
            return filtered.sort((a, b) => {
                const da = a.dateSubmittedISO ? new Date(a.dateSubmittedISO).getTime() : 0;
                const db = b.dateSubmittedISO ? new Date(b.dateSubmittedISO).getTime() : 0;
                return sortOrder === 'desc' ? db - da : da - db;
            });
        }, [cases, searchQuery, statusFilter, sortOrder]);

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
                    <StatisticsTile icon={faClockRotateLeft} iconColor="var(--accent-color)" title="Pending Mold Cases" statNum={caseStats.pending} />
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

                        {/* Sort by Date */}
                        <div className="w-full lg:w-auto">
                            <StatusDropdown
                                placeholder="Sort By Date"
                                backgroundColor="var(--primary-color)"
                                textColor="var(--background-color)"
                                options={[
                                    { label: "Newest First", value: "desc" },
                                    { label: "Oldest First", value: "asc" }
                                ]}
                                onSelect={(value) => setSortOrder(value as 'asc' | 'desc')}
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
                            onEdit={(c: any) => {
                                const params = new URLSearchParams({ id: c.id });
                                router.push(`/investigation/view-case?${params.toString()}`);
                            }}
                        />
                        {/* Loading indicator for additional pages */}
                        {isLoadingMore && (
                            <div className="py-4 text-center">
                                <PageLoading message="Loading more cases..." compact />
                            </div>
                        )}
                    </>
                )}
            </div>
            
        </main>
    );
}
