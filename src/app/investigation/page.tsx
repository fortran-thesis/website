"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSeedling, faClockRotateLeft, faHourglassHalf, faCircleCheck} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import StatusDropdown from '@/components/StatusDropdown';
import {useState, useEffect, useRef} from 'react'
import { faHourglass } from '@fortawesome/free-solid-svg-icons/faHourglass';
import { useAuth } from '@/hooks/useAuth';

export default function Investigation() {
        console.log('🚀 Investigation component rendering');
        const { user: authUser, loading: authLoading } = useAuth();
        console.log('🔐 Auth state:', { authUser, authLoading });
        
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
        
        console.log('🔍 INVESTIGATION ROLE DETECTION:');
        console.log('  authUser:', authUser);
        console.log('  user.role:', user.role);
        console.log('  isAdministrator:', isAdministrator);
        console.log('  isMycologist:', isMycologist);
        console.log('  userRole:', userRole);
    
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

    // Client-side filtering for cases
    const getFilteredCases = () => {
        return cases.filter((c) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                c.caseName?.toLowerCase().includes(searchLower) ||
                c.cropName?.toLowerCase().includes(searchLower) ||
                c.location?.toLowerCase().includes(searchLower) ||
                c.submittedBy?.toLowerCase().includes(searchLower) ||
                c.description?.toLowerCase().includes(searchLower) ||
                c.status?.toLowerCase().includes(searchLower) ||
                c.priority?.toLowerCase().includes(searchLower);

            const priorityValue = c.priority?.toLowerCase();
            const matchesPriority = !priorityFilter || priorityFilter === 'all' || priorityValue === priorityFilter;

            const statusValue = c.status?.toLowerCase();
            const matchesStatus = !statusFilter || statusFilter === 'all' || statusValue === statusFilter;

            return matchesSearch && matchesPriority && matchesStatus;
        });
    };

    const filteredCases = getFilteredCases();
    
    // Track if we've logged sample data
    let hasLoggedSample = false;
    
    // Map report data to display format
    const mapReportToCase = (it: any) => {
        // Log first item to debug data structure
        if (!hasLoggedSample) {
            console.log('🔍 Sample case data structure:', it);
            console.log('  reporter:', it.reporter);
            console.log('  mold_case:', it.mold_case);
            console.log('  user_id:', it.user_id);
            console.log('  location:', it.location);
            hasLoggedSample = true;
        }
        
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
        
        // Use correct field paths based on API response structure
        const location = it.mold_case?.location || 
                        it.location || 
                        it.reporter?.address || 
                        it.address || 
                        'N/A';
        
        const submittedBy = it.user_id || 
                           it.reporter?.name || 
                           it.mold_case?.user_id ||
                           'N/A';
        
        return {
            id: it.id,
            caseName: it.case_name || '',
            cropName: it.host || '',
            location,
            submittedBy,
            dateSubmitted,
            priority: it.mold_case?.priority.charAt(0).toUpperCase() + it.mold_case?.priority.slice(1) || 'Unassigned',
            status: it.status.charAt(0).toUpperCase() + it.status.slice(1) || 'Pending',
            description,
        };
    };

    useEffect(() => {
        console.log('🔍 Investigation useEffect triggered:', { authLoading, isAdministrator, isMycologist });
        if (authLoading) {
            console.log('⏳ Auth still loading, skipping fetch');
            return;
        }
        
        // Fetch stats based on role
        const fetchStats = async () => {
            try {
                let statsEndpoint = '';
                
                if (isAdministrator) {
                    // Admin: get all cases count
                    statsEndpoint = '/api/v1/mold-reports/count/status';
                    console.log('📊 Fetching admin stats from:', statsEndpoint);
                    
                    const statsRes = await fetch(statsEndpoint, { cache: 'no-store' });
                    if (statsRes.ok) {
                        const body = await statsRes.json();
                        if (body.success && body.data) {
                            setCaseStats(body.data);
                            console.log('✅ Admin stats loaded:', body.data);
                        }
                    }
                } else if (isMycologist) {
                    // Mycologist: get assigned cases count
                    const mycologistId = authUser?.user?.id || authUser?.id;
                    if (!mycologistId) {
                        console.error('❌ Mycologist ID not found');
                        return;
                    }
                    
                    statsEndpoint = `/api/v1/mold-report/assigned/count?id=${mycologistId}`;
                    console.log('📊 Fetching mycologist stats from:', statsEndpoint);
                    
                    const statsRes = await fetch(statsEndpoint, { cache: 'no-store' });
                    if (statsRes.ok) {
                        const body = await statsRes.json();
                        if (body.data) {
                            // API returns { data: { total: 0 } }
                            // Set stats with total for all tiles
                            const totalAssigned = body.data.total || 0;
                            setCaseStats({
                                total: totalAssigned,
                                pending: 0, // These will be calculated from fetched cases
                                in_progress: 0,
                                resolved: 0,
                                closed: 0
                            });
                            console.log('✅ Mycologist stats loaded:', { total: totalAssigned });
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Failed to fetch stats:', err);
            }
        };
        fetchStats();
        
        // Fetch ALL cases (load all pages immediately)
        let mounted = true;
        const fetchAllCases = async () => {
            setLoading(true);
            setError(null);
            try {
                let allCases: any[] = [];
                let currentToken: string | null = null;
                let pageCount = 0;
                
                // Determine endpoint based on role
                let endpoint = '';
                if (isAdministrator) {
                    endpoint = '/api/v1/mold-reports?limit=100';
                } else if (isMycologist) {
                    endpoint = '/api/v1/mold-reports/assigned?limit=100';
                } else {
                    console.error('❌ Invalid user role');
                    setLoading(false);
                    return;
                }
                
                console.log('🔍 Investigation - Fetching from:', endpoint);
                
                // Load first page with higher limit to try to get all cases at once
                const firstRes = await fetch(endpoint, { cache: 'no-store' });
                if (!firstRes.ok) {
                    throw new Error('Failed to load cases');
                }
                const firstBody = await firstRes.json();
                const firstItems = Array.isArray(firstBody.data?.snapshot) ? firstBody.data.snapshot : [];
                allCases = firstItems.map(mapReportToCase);
                currentToken = firstBody.data?.nextPageToken || null;
                pageCount++;
                
                console.log('📄 Page 1: loaded', firstItems.length, 'cases with limit=100');
                console.log('🔍 Next page token:', currentToken);
                
                // Determine base URL for pagination
                const baseUrl = isAdministrator ? '/api/v1/mold-reports' : '/api/v1/mold-reports/assigned';
                
                // Load remaining pages
                while (currentToken && mounted) {
                    const params = new URLSearchParams();
                    params.set('limit', '10');
                    params.set('pageToken', currentToken);
                    const url = `${baseUrl}?${params.toString()}`;
                    
                    console.log(`📄 Fetching page ${pageCount + 1} with token:`, currentToken);
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) break;
                    
                    const body = await res.json();
                    const items = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                    const mapped = items.map(mapReportToCase);
                    
                    console.log(`📄 Page ${pageCount + 1}: received`, items.length, 'items from API');
                    
                    // Check if we're getting duplicate data
                    const existingIds = new Set(allCases.map(c => c.id));
                    const duplicateCount = mapped.filter((c: any) => existingIds.has(c.id)).length;
                    const newCases = mapped.filter((c: any) => !existingIds.has(c.id));
                    
                    console.log(`📄 Duplicates found: ${duplicateCount}, New cases: ${newCases.length}`);
                    
                    if (newCases.length === 0 && mapped.length > 0) {
                        console.warn('⚠️ All cases are duplicates, stopping pagination');
                        break;
                    }
                    
                    allCases = [...allCases, ...newCases];
                    pageCount++;
                    
                    const newToken = body.data?.nextPageToken || null;
                    console.log(`📄 New token:`, newToken);
                    if (newToken === currentToken) {
                        console.warn('⚠️ Same token returned, stopping');
                        break;
                    }
                    currentToken = newToken;
                }
                
                console.log('✅ All pages loaded:', allCases.length, 'total cases');
                
                if (mounted) {
                    setCases(allCases);
                    setNextPageToken(null); // No more pages needed
                    
                    // Update stats breakdown for mycologists based on actual cases
                    if (isMycologist && allCases.length > 0) {
                        const statusBreakdown = allCases.reduce((acc, c) => {
                            const status = c.status?.toLowerCase() || 'pending';
                            if (status === 'pending') acc.pending++;
                            else if (status === 'in progress') acc.in_progress++;
                            else if (status === 'resolved') acc.resolved++;
                            else if (status === 'closed') acc.closed++;
                            return acc;
                        }, { pending: 0, in_progress: 0, resolved: 0, closed: 0 });
                        
                        setCaseStats({
                            total: allCases.length,
                            ...statusBreakdown
                        });
                        console.log('✅ Updated mycologist stats breakdown:', statusBreakdown);
                    }
                }
            } catch (err) {
                if (mounted) setError(err instanceof Error ? err.message : 'Failed to load cases');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        
        fetchAllCases();
        return () => { mounted = false; };
    }, [authLoading, isAdministrator, isMycologist]);

    // Auto-load all pages recursively
    useEffect(() => {
        console.log('🔍 Auto-load effect fired:', { 
            hasToken: !!nextPageToken, 
            isLoadingMore, 
            loading,
            token: nextPageToken 
        });
        
        if (!nextPageToken || isLoadingMore) {
            console.log('❌ Auto-load blocked:', { 
                reason: !nextPageToken ? 'no token' : 'already loading' 
            });
            return;
        }
        
        console.log('✅ Auto-load proceeding...');
        
        const loadNextPage = async () => {
            setIsLoadingMore(true);
            try {
                const params = new URLSearchParams();
                params.set('limit', '12');
                params.set('pageToken', nextPageToken);
                const url = `/api/v1/mold-reports?${params.toString()}`;
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
                    setNextPageToken(null);
                    setIsLoadingMore(false);
                    return;
                }

                setCases(prev => {
                    const updated = [...prev, ...mapped];
                    return updated;
                });
                setNextPageToken(newToken);
            } catch (err) {
                console.error('Failed to load more cases:', err);
            } finally {
                setIsLoadingMore(false);
            }
        };

        const timer = setTimeout(loadNextPage, 100);
        return () => clearTimeout(timer);
    }, [nextPageToken, isLoadingMore]);

    // Intersection Observer for manual scroll pagination
    useEffect(() => {
        if (!nextPageToken || isLoadingMore) return;

        const handleLoadMore = async () => {
            setIsLoadingMore(true);
            try {
                const params = new URLSearchParams();
                params.set('limit', '10');
                params.set('pageToken', nextPageToken);
                const url = `/api/v1/mold-reports?${params.toString()}`;
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) {
                    throw new Error('Failed to load more cases');
                }
                const body = await res.json();
                const items = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                const mapped = items.map(mapReportToCase);

                const newToken = body.data?.nextPageToken || null;
                if (newToken === nextPageToken && mapped.length > 0) {
                    console.warn('Backend returned same token - stopping pagination');
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
                        {/* Filter by Priority */}
                        <div className="w-full lg:w-auto">
                            <StatusDropdown
                                placeholder="Filter By Priority"
                                backgroundColor="var(--accent-color)"
                                textColor="var(--moldify-black)"
                                options={[
                                    { label: "All", value: "all" },
                                    { label: "Low Priority", value: "low" },
                                    { label: "Medium Priority", value: "medium" },
                                    { label: "High Priority", value: "high" }
                                ]}
                                onSelect={(value) => setPriorityFilter(value)}
                            />
                        </div>

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
                                            { label: "Closed", value: "closed" }
                                        ]
                                        : [
                                            { label: "All", value: "all" },
                                            { label: "Pending", value: "pending" },
                                            { label: "In Progress", value: "in progress" },
                                            { label: "Resolved", value: "resolved" },
                                            { label: "Rejected", value: "rejected"},
                                            { label: "Closed", value: "closed" }
                                        ]
                                }
                                onSelect={(value) => setStatusFilter(value)}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="w-full">
                {loading && <p className="text-center text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl mt-10">Loading cases...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && (
                    <>
                        <CaseTable
                            cases={filteredCases}
                            onEdit={(c: any) => {
                                const params = new URLSearchParams({
                                    id: c.id,
                                    priority: c.priority || "",
                                });
                                window.location.href = `/investigation/view-case?${params.toString()}`;
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
