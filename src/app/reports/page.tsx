"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';
import StatusDropdown from '@/components/StatusDropdown';
import StatisticsTile from '@/components/tiles/statistics_tile';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import ReportsTable, { Report } from '@/components/tables/report_table';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useFlagReportsInfinite } from '@/hooks/swr';

export default function Reports() {
       
    const userRole = "Administrator";
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const normalizeStatus = (rawStatus?: string) => {
      const status = (rawStatus || '').toString().trim().toLowerCase();
      if (status === 'resolved') return 'Resolved';
      if (status === 'unresolved') return 'Unresolved';
      return rawStatus ? rawStatus : 'Unresolved';
    };

    // SWR: paginated flag reports
    const {
      data: reportPages,
      size,
      setSize,
      isLoading: loading,
      isValidating: isLoadingMore,
    } = useFlagReportsInfinite(10);

    const reports: Report[] = useMemo(
      () =>
        (reportPages ?? []).flatMap((page: any) =>
            (page.data?.snapshot ?? []).map((r: any) => {
            // FlagReport shape: prefer `id`, fall back to `content_id`.
            const id = r.id || r.content_id || 'unknown';
            const rawStatus = r.status || r.metadata?.status;
            return {
              id,
              issue: r.reason || r.details || 'Unknown Issue',
                  reportedUser: r.reported?.name || r.content_id || r.reported_user_id || 'Unknown',
              reportedBy: r.reporter?.name || r.reporter_name || r.reporter_id || r.reporterId || 'Unknown',
              dateReported: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
              status: normalizeStatus(rawStatus),
            };
          }),
        ),
      [reportPages],
    );

    const hasMore = reportPages?.[reportPages.length - 1]?.data?.nextPageToken;
    const error: string | null = null;

    // Derive stats from loaded data
    const stats = useMemo(() => {
      const unresolvedData = reports.filter((r) => r.status === 'Unresolved');
      const resolvedData = reports.filter((r) => r.status === 'Resolved');
      return { total: reports.length, unresolved: unresolvedData.length, resolved: resolvedData.length };
    }, [reports]);

    // Infinite scroll: load next SWR page
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
