"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClipboard, faUsers, faPlus } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';
import CaseTable from '@/components/tables/case_table';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import DonutChart from '@/components/charts/donut-chart';
import UserTable from '@/components/tables/user_table';
import { useState } from 'react';
import AddMycoModal, { MycoFormData } from '@/components/modals/create_myco_acc_modal';


export default function Users() {
    const [isAddMycoModal, setShowAddMycoModal] = useState(false);


   const userRole = "Administrator";
    const userStatusData = [
        { name: "Inactive", value: 10, color: "var(--moldify-red)" },
        { name: "Active", value: 30, color: "var(--primary-color)" },
    ];
     const users = [
    {
      id: "PDIRecT6",
      name: "Karl Manuel Diata",
      email: "karl123456789@gmail.com",
      role: "Farmer",
      status: "Active",
    },
    {
      id: "PDIRecT6",
      name: "Karl Manuel Diata",
      email: "karl123456789@gmail.com",
      role: "Mycologist",
      status: "Inactive",
    },
    {
      id: "PDIRecT6",
      name: "Karl Manuel Diata",
      email: "karl123456789@gmail.com",
      role: "Administrator",
      status: "Active",
    },
  ];

  const handleMycoSubmit = (data: MycoFormData) => {
    console.log('Form submitted:', data);
    // Add your API call or logic here
    // For example: await createMycologist(data);
    
    // Close modal after successful submission
    setShowAddMycoModal(false);
  };
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
            <div className ="flex flex-col xl:flex-row w-full mt-6 gap-x-2 gap-y-2">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 w-full xl:w-2/3">
                    <StatisticsTile icon={faUsers} iconColor="var(--accent-color)" title="Total Users" statNum={0} />
                    <StatisticsTile icon={faUsers} iconColor="var(--primary-color)" title="Total Farmers" statNum={0} />
                    <StatisticsTile icon={faUsers} iconColor="var(--moldify-blue)" title="Total Mycologists" statNum={0} />
                    <StatisticsTile icon={faUsers} iconColor="var(--moldify-red)" title="Total Administrators" statNum={0} />
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
              <UserTable data={users} />
          </div>
        
             <AddMycoModal
                isOpen={isAddMycoModal}
                onClose={() => setShowAddMycoModal(false)}
                onSubmit={handleMycoSubmit}
            />
        </main>
    );
}
