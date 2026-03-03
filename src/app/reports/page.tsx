"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import StatusDropdown from '@/components/StatusDropdown';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import ReportsTable, { Report } from '@/components/tables/report_table';
import { useEffect, useState, useRef, useMemo } from 'react';

export default function Reports() {
       
    const userRole = "Administrator";

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [stats, setStats] = useState({
      total: 0,
      unresolved: 0,
      resolved: 0,
    });

    const normalizeStatus = (rawStatus?: string) => {
      const status = (rawStatus || '').toString().trim().toLowerCase();
      if (status === 'resolved') return 'Resolved';
      if (status === 'unresolved') return 'Unresolved';
      return rawStatus ? rawStatus : 'Unresolved';
    };

    // Build search with active filters
    const buildSearchUrl = (token?: string | null) => {
      const params = new URLSearchParams();
      params.set('limit', '10');
      if (token) params.set('pageToken', token);
      return `/api/v1/reports?${params.toString()}`;
    };

    // Fetch reports
    useEffect(() => {
      let mounted = true;

      const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
          const url = buildSearchUrl();
          console.log('📊 Fetching reports from:', url);
          const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
          console.log('📊 Reports response status:', res.status);
          
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            console.error('📊 Reports error response:', body);
            throw new Error(body?.error || `Failed to load reports (Status: ${res.status})`);
          }

          const body = await res.json();
          console.log('Reports body:', body);
          console.log('First report RAW data:', JSON.stringify(body.data?.snapshot?.[0], null, 2));
          
          if (body.success && body.data?.snapshot) {
            const reportsData = body.data.snapshot.map((r: any) => {
              // Check for status in metadata or root level
              const rawStatus = r.status || r.report_status || r.resolution_status || r.metadata?.status || r.metadata?.report_status;
              const status = normalizeStatus(rawStatus);
              console.log('📊 Report status mapping:', { 
                id: r.id, 
                rawStatus, 
                normalized: status, 
                hasMetadata: !!r.metadata,
                allRootFields: Object.keys(r),
                metadataFields: r.metadata ? Object.keys(r.metadata) : []
              });
              
              return {
                id: r.id,
                issue: r.reason || 'Unknown Issue',
                reportedUser: r.reported_user_id || 'Unknown',
                reportedBy: r.reporter_id || 'Unknown',
                dateReported: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
                status: status,
              };
            });
            if (mounted) {
              setReports(reportsData);
              setNextPageToken(body.data.nextPageToken || null);
            }
          } else {
            console.log('📊 Unexpected response structure:', body);
            if (mounted) {
              setReports([]);
              setStats({ total: 0, unresolved: 0, resolved: 0 });
            }
          }
        } catch (err) {
          console.error('📊 Failed to fetch reports:', err);
          if (mounted) setError(err instanceof Error ? err.message : 'Failed to load reports');
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchReports();
      return () => { mounted = false; };
    }, []);

    // Recalculate stats whenever reports array changes
    useEffect(() => {
      const unresolvedData = reports.filter((r: Report) => r.status === 'Unresolved');
      const resolvedData = reports.filter((r: Report) => r.status === 'Resolved');
      
      setStats({
        total: reports.length,
        unresolved: unresolvedData.length,
        resolved: resolvedData.length,
      });
      
      console.log('📊 Stats updated:', { total: reports.length, unresolved: unresolvedData.length, resolved: resolvedData.length });
    }, [reports]);

    // Infinite scroll
    useEffect(() => {
      if (!nextPageToken || isLoadingMore) return;

      const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
          const url = buildSearchUrl(nextPageToken);
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to load more reports');

          const body = await res.json();
          if (body.success && body.data?.snapshot) {
            const newReportsData = body.data.snapshot.map((r: any) => ({
              id: r.id,
              issue: r.reason || 'Unknown Issue',
              reportedUser: r.reported_user_id || 'Unknown',
              reportedBy: r.reporter_id || 'Unknown',
              dateReported: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
              status: normalizeStatus(r.status || r.report_status || r.resolution_status),
            }));

            if (newReportsData.length === 0) {
              setNextPageToken(null);
              setIsLoadingMore(false);
              return;
            }

            const newToken = body.data.nextPageToken || null;
            if (!newToken || newToken === nextPageToken) {
              setNextPageToken(null);
              setIsLoadingMore(false);
              return;
            }

            setReports(prev => [...prev, ...newReportsData]);
            setNextPageToken(newToken);
          }
        } catch (err) {
          console.error('Failed to load more reports:', err);
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

    const filteredReports = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      const status = statusFilter.trim().toLowerCase();

      return reports.filter((report) => {
        const reportStatus = (report.status || '').toLowerCase();
        const matchesStatus =
          !status || status === 'all' || reportStatus === status;

        if (!matchesStatus) return false;
        if (!query) return true;

        return [
          report.issue,
          report.reportedUser,
          report.reportedBy,
          report.status,
          report.dateReported,
          report.id,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }, [reports, searchQuery, statusFilter]);
    
    return (
        <main className="relative flex flex-col xl:py-2 py-10 w-full">

            {/* Header Section */}
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <Breadcrumbs role={userRole} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        REPORTS
                    </h1>
                </div>

            </div>
            {/* End Header Section */}
            
            {/* Statistics Tiles */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-6">
                <StatisticsTile icon={faTriangleExclamation} iconColor="var(--accent-color)" title="Total Reports" statNum={stats.total} />
                <StatisticsTile icon={faTriangleExclamation} iconColor="var(--moldify-red)" title="Total Unresolved Reports" statNum={stats.unresolved} />
                <StatisticsTile icon={faTriangleExclamation} iconColor="var(--primary-color)" title="Total Resolved Reports" statNum={stats.resolved} />
            </div>
            
            {/* Submitted Cases Section */}
            <div className="flex flex-col md:flex-row md:items-center mt-10 gap-4 w-full">
                {/* Left Label */}
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
                    User Reports
                </p>

                {/* Right Section */}
                <div className="flex flex-col md:flex-row md:ml-auto gap-x-2 gap-y-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex items-center w-full md:w-100">
                        <label htmlFor="search" className="sr-only">Search Cases</label>
                        <input
                            id="search"
                            placeholder="Search Cases"
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--background-color)] py-2 px-4 rounded-full border-2 border-[var(--primary-color)] focus:outline-none w-full pr-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 w-full md:w-auto">

                        {/* Custom Status Dropdown */}
                        <StatusDropdown
                          placeholder="Filter By Status"
                          backgroundColor="var(--accent-color)"
                          textColor="var(--moldify-black)"
                          options={[
                            { label: "All", value: "all" },
                            { label: "Resolved", value: "resolved" },
                            { label: "Unresolved", value: "unresolved" }
                          ]}
                          onSelect={(value) => setStatusFilter(value)}
                        />
                    </div>
                </div>
            </div>

            {/* Submitted Cases Table */}
            <div className="mt-6 w-full">
              {loading && <p className="text-center text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl mt-10">Loading reports...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !error && <ReportsTable data={filteredReports} 
                onEdit={(c: Report) => {
                        window.location.href = `/reports/view-report?id=${c.id}`;
                    }}
                />}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="py-4 text-center">
                {isLoadingMore && <p className="text-sm text-[var(--moldify-grey)]">Loading more reports...</p>}
              </div>
            </div>
            
        </main>
    );
}
