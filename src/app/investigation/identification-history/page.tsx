"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import IdentificationHistoryTable from "@/components/tables/identification_history_table";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const userRole = "Administrator";
const identificationHistory = [
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    {
      genusID: "PDlReCT6Jk2mHaIdVfnN",
      genusName: "Aspergillus",
      dateIdentified: "October 30, 2025",
    },
    

  ];

export default function Home() {
    return (
        <main className="relative flex flex-col xl:py-2 py-10 overflow-x-auto">

            {/* Header Section */}
            <div className="flex flex-row justify-between mb-10">
                <div className="flex flex-col">
                    <Breadcrumbs role={userRole} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        INVESTIGATION OVERSIGHT
                    </h1>
                </div>
            </div>
            {/* End Header Section */}
            <BackButton />

            <div className="flex flex-col md:flex-row md:items-center mt-7 gap-4 w-full">
                {/* Left Label */}
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold">
                    Identification History
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
                </div>
            </div>
            <IdentificationHistoryTable identHistory=
            {
                identificationHistory
            } 
            />
        </main>
    );
}
