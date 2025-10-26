"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboard} from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';

export default function Investigation() {
    const cases = [
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
    {
      caseName: "Tomato Mold",
      cropName: "Kamatis Tagalog",
      location: "Ilocos Region",
      submittedBy: "Faith Gabrielle Gamboa",
      dateSubmitted: "2023-09-01",
      priority: "Low Priority",
      status: "In Progress",
    },
  ];

   const userRole = "Administrator";

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
                <StatisticsTile icon={faClipboard} iconColor="var(--moldify-black)" title="Total Cases" statNum={0} />
                <StatisticsTile icon={faClipboard} iconColor="var(--accent-color)" title="Pending Mold Cases" statNum={0} />
                <StatisticsTile icon={faClipboard} iconColor="var(--moldify-blue)" title="In Progress Mold Cases" statNum={0} />
                <StatisticsTile icon={faClipboard} iconColor="var(--primary-color)" title="Resolved Mold Cases" statNum={0} />
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
            </div>


            {/* Submitted Cases Table */}
            <div className="mt-6 w-full">
              <CaseTable
                  cases={cases}
                  onEdit={(c) => {
                      window.location.href = '/investigation/view-case';
                  }}
              />
          </div>
            
        </main>
    );
}
