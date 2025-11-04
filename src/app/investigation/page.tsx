"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboard} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import {useState, useEffect} from 'react'

export default function Investigation() {
        const [caseStats, setCaseStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 });
        const [cases, setCases] = useState<any[]>([]); // You can update this to fetch actual cases if needed
        const userRole = "Administrator";

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, casesRes] = await Promise.all([
                    fetch('/api/v1/mold-reports/count/status', { cache: 'no-store' }),
                    fetch('/api/v1/mold-reports?limit=10', { cache: 'no-store' }),
                ]);

                if (statsRes.ok) {
                    const body = await statsRes.json();
                    if (body.success && body.data) setCaseStats(body.data);
                }

                if (casesRes.ok) {
                    const body = await casesRes.json();
                    const items = Array.isArray(body.data?.snapshot) ? body.data.snapshot : [];
                    const mapped = items.map((it: any) => {
                        // Prefer structured metadata created_at (seconds) -> ISO, fall back to date_observed
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
                    });
                    setCases(mapped);
                }
            } catch (err) {
                // ignore for now
            }
        };
        fetchAll();
    }, []);

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
            <div className="flex flex-col md:flex-row md:items-center mt-10 gap-4 w-full">
                {/* Left Label */}
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
                    Submitted Cases
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
                            <option value="" className="bg-[var(--taupe)] text-[var(--primary-color)] font-bold" disabled>
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
                            className="bg-[var(--accent-color)] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer focus:outline-none w-full md:w-auto"
                            defaultValue=""
                        >
                            <option value="" className="bg-[var(--taupe)] text-[var(--primary-color)] font-bold" disabled>
                            Filter By Status
                            </option>
                            <option value="all" className="bg-[var(--taupe)]">All</option>
                            <option value="in-progress" className="bg-[var(--taupe)]">In Progress</option>
                            <option value="resolved" className="bg-[var(--taupe)]">Resolved</option>
                            <option value="closed" className="bg-[var(--taupe)]">Closed</option>
                            <option value="pending" className="bg-[var(--taupe)]">Pending</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-6 w-full">
              <CaseTable
                  cases={cases}
                  onEdit={(c: any) => {
                      window.location.href = `/investigation/view-case?id=${c.id}`;
                  }}
              />
          </div>
            
        </main>
    );
}
