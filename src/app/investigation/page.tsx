"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboard} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import {useState, useEffect, useRef} from 'react'

export default function Investigation() {
        const [caseStats, setCaseStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 });
        const [cases, setCases] = useState<any[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [isLoadingMore, setIsLoadingMore] = useState(false);
        const [nextPageToken, setNextPageToken] = useState<string | null>(null);
        const loadMoreRef = useRef<HTMLDivElement>(null);
        
        // Search and filter state
        const [searchQuery, setSearchQuery] = useState('');
        const [priorityFilter, setPriorityFilter] = useState('');
        const [statusFilter, setStatusFilter] = useState('');
        
        const userRole = "Administrator";

    // Build search URL with active filters
    const buildSearchUrl = (token?: string | null) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter);
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        params.set('limit', '10');
        if (token) params.set('pageToken', token);

        const queryString = params.toString();
        // If no filters, use regular /mold-reports endpoint; otherwise use /mold-reports/search
        if (!searchQuery && !priorityFilter && !statusFilter) {
            return `/api/v1/mold-reports?${queryString}`;
        }
        return `/api/v1/mold-reports/search?${queryString}`;
    };

    // Map report data to display format
    const mapReportToCase = (it: any) => {
        let dateSubmittedISO = '';
        if (it.metadata?.created_at?._seconds) {
            dateSubmittedISO = new Date(it.metadata.created_at._seconds * 1000).toISOString();
        } else if (it.date_observed) {
            dateSubmittedISO = it.date_observed;
        }
        const dateSubmitted = dateSubmittedISO
            ? new Date(dateSubmittedISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
            : '';
        const description = Array.isArray(it.case_details) && it.case_details[0]?.description ? it.case_details[0].description : '';
        return {
            id: it.id,
            caseName: it.case_name || '',
            cropName: it.host || '',
            location: it.reporter?.address || '',
            submittedBy: it.reporter?.name || '',
            dateSubmitted,
            priority: it.mold_case?.priority.charAt(0).toUpperCase() + it.mold_case?.priority.slice(1) || 'Unassigned',
            status: it.status.charAt(0).toUpperCase() + it.status.slice(1) || 'Pending',
            description,
        };
    };

    useEffect(() => {
        // Fetch stats
        const fetchStats = async () => {
            try {
                const statsRes = await fetch('/api/v1/mold-reports/count/status', { cache: 'no-store' });
                if (statsRes.ok) {
                    const body = await statsRes.json();
                    if (body.success && body.data) setCaseStats(body.data);
                }
            } catch (err) {
                // ignore for now
            }
        };
        fetchStats();
        
        // Fetch cases with current filters
        let mounted = true;
        const fetchCases = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = buildSearchUrl();
                const casesRes = await fetch(url, { cache: 'no-store' });
                if (!casesRes.ok) {
                    throw new Error('Failed to load cases');
                }
                const body = await casesRes.json();
                const items = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                const mapped = items.map(mapReportToCase);
                if (mounted) {
                    setCases(mapped);
                    setNextPageToken(body.data?.nextPageToken || null);
                }
            } catch (err) {
                if (mounted) setError(err instanceof Error ? err.message : 'Failed to load cases');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        
        fetchCases();
        return () => { mounted = false; };
    }, [searchQuery, priorityFilter, statusFilter]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!nextPageToken || isLoadingMore) return;

        const handleLoadMore = async () => {
            setIsLoadingMore(true);
            try {
                const url = buildSearchUrl(nextPageToken);
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) {
                    throw new Error('Failed to load more cases');
                }
                const body = await res.json();
                const items = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                const mapped = items.map(mapReportToCase);

                // Safety check: if token didn't change and we got data, stop loading
                const newToken = body.data?.nextPageToken || null;
                if (newToken === nextPageToken && mapped.length > 0) {
                    console.warn('⚠️ Backend returned same token - stopping pagination');
                    setNextPageToken(null);
                    setIsLoadingMore(false);
                    return;
                }

                setCases(prev => [...prev, ...mapped]);
                setNextPageToken(newToken);
            } catch (err) {
                console.error('Failed to load more cases:', err);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
                <StatisticsTile icon={faClipboard} iconColor="var(--moldify-black)" title="Total Cases" statNum={caseStats.total} />
                <StatisticsTile icon={faClipboard} iconColor="var(--accent-color)" title="Pending Mold Cases" statNum={caseStats.pending} />
                <StatisticsTile icon={faClipboard} iconColor="var(--moldify-blue)" title="In Progress Mold Cases" statNum={caseStats.in_progress} />
                <StatisticsTile icon={faClipboard} iconColor="var(--primary-color)" title="Resolved Mold Cases" statNum={caseStats.resolved} />
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
                                setNextPageToken(null);
                            }}
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 w-full lg:w-auto">
                        {/* Filter by Priority */}
                        <label htmlFor="priority" className="sr-only">Filter by Priority</label>
                        <select
                            id="priority"
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setNextPageToken(null);
                            }}
                            className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full lg:w-auto"
                        >
                            <option value="" className="bg-[var(--taupe)] text-[var(--primary-color)] font-bold">
                            Filter By Priority
                            </option>
                            <option value="all" className="bg-[var(--taupe)]">All</option>
                            <option value="low" className="bg-[var(--taupe)]">Low Priority</option>
                            <option value="medium" className="bg-[var(--taupe)]">Medium Priority</option>
                            <option value="high" className="bg-[var(--taupe)]">High Priority</option>
                        </select>

                        {/* Filter by Status */}
                        <label htmlFor="status" className="sr-only">Filter by Status</label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setNextPageToken(null);
                            }}
                            className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full lg:w-auto"
                        >
                            <option value="" className="bg-[var(--taupe)] text-[var(--primary-color)] font-bold">
                            Filter By Status
                            </option>
                            <option value="all" className="bg-[var(--taupe)]">All</option>
                            <option value="pending" className="bg-[var(--taupe)]">Pending</option>
                            <option value="in_progress" className="bg-[var(--taupe)]">In Progress</option>
                            <option value="resolved" className="bg-[var(--taupe)]">Resolved</option>
                            <option value="closed" className="bg-[var(--taupe)]">Closed</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-6 w-full">
                {loading && <p>Loading cases...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && (
                    <>
                        <CaseTable
                            cases={cases}
                            onEdit={(c: any) => {
                                window.location.href = `/investigation/view-case?id=${c.id}`;
                            }}
                        />
                        {/* Infinite scroll trigger */}
                        <div ref={loadMoreRef} className="py-4 text-center">
                            {isLoadingMore && <p className="text-sm text-[var(--moldify-grey)]">Loading more cases...</p>}
                        </div>
                    </>
                )}
            </div>
            
        </main>
    );
}
