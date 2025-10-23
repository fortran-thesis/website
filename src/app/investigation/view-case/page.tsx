"use client";

import Breadcrumbs from '@/components/breadcrumbs_nav';
import BackButton from '@/components/buttons/back_button';
import TabBar from '@/components/tab_bar';
import StatusBox from '@/components/tiles/status_tile';
import { faSeedling, faClipboardList, faClockRotateLeft, faFilePdf, faFlask, faPlus, faSprayCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from "next/image";
import CaseDetailsTab from '../investigation-tabs/case_details';
import InVitroTab from '../investigation-tabs/in_vitro';
import InVivoTab from '../investigation-tabs/in_vivo';
import { useState } from 'react';
import AssignCaseModal from '@/components/modals/assign_case_modal';
import ConfirmModal from '@/components/modals/confirmation_modal';

const mycologists: { name: string; status: "available" | "at-capacity"; cases: number }[] = [
  { name: "Dr. Lisa Wong", status: "available", cases: 4 },
  { name: "Dr. John Doe", status: "at-capacity", cases: 8 },
  { name: "Dr. Jane Smith", status: "available", cases: 2 },
];

export default function Investigation() {
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);

    const handleAssign = (mycologist: any, priority: string, endDate: Date | null) => {
    console.log("Assigned to:", mycologist, priority, endDate);
    setAssignModalOpen(false);
    };
    const userRole = "Administrator";
    const imageUrl = "/profile-placeholder.png";
    const name = "Lauren Bishmilla";
    const email = "laurenbishmilla@gmail.com";
    const phone = "09674306842";
    const tabs = [
        {
        label: "Case Details",
        icon: faClipboardList,
        content: <CaseDetailsTab
            entries={[
                {
                date: "October 2, 2025 • 09:14 PM",
                notes: "Observed white spots on leaves.",
                images: ["/assets/moldify-logo-v3.svg", "/sample2.jpg"],
                },
                {
                date: "October 2, 2025 • 09:14 PM",
                notes: "Observed white spots on leaves.",
                images: ["/assets/moldify-logo-v3.svg", "/sample2.jpg", "/assets/moldify-logo-v3.svg", "/assets/moldify-logo-v3.svg", "/assets/moldify-logo-v3.svg"],
                },
                {
                date: "October 2, 2025 • 09:14 PM",
                notes: "Observed white spots on leaves.",
                images: ["/assets/moldify-logo-v3.svg", "/sample2.jpg", "/assets/moldify-logo-v3.svg", "/assets/moldify-logo-v3.svg", "/assets/moldify-logo-v3.svg"],
                },

            ]}
            />
        },
        {
        label: "In Vitro",
        icon: faFlask,
        content: <InVitroTab
            dateTime="Last Updated: November 01, 2025 • 10:00 AM"
            growthMedium="Potato Dextrose Agar (PDA)"
            incubationTemperature="25°C"
            inVitroEntries={[
                {
                    date: "November 01, 2025 • 10:00 AM",
                    imagePath: "/images/sample1.jpg",
                    sizeValue: "5 mm",
                    colorValue: "White",
                    notes: "Colony growing steadily.",
                },
                {
                    date: "November 01, 2025 • 10:00 AM",
                    imagePath: "/images/sample2.jpg",
                    sizeValue: "7 mm",
                    colorValue: "Cream",
                    notes: "Some contamination observed.",
                },
            ]}
            />
        },
        {
        label: "In Vivo",
        icon: faSeedling,
        content: <InVivoTab
            dateTime="Last Updated: November 01, 2025 • 10:00 AM"
            growthMedium="Potato Dextrose Agar (PDA)"
            incubationTemperature="25°C"
            inVivoEntries={[
                {
                    date: "November 01, 2025 • 10:00 AM",
                    imagePath: "/images/sample1.jpg",
                    sizeValue: "5 mm",
                    colorValue: "White",
                    notes: "Colony growing steadily.",
                },
                {
                    date: "November 01, 2025 • 10:00 AM",
                    imagePath: "/images/sample2.jpg",
                    sizeValue: "7 mm",
                    colorValue: "Cream",
                    notes: "Some contamination observed.",
                },
            ]}
            />
        },
    ];
    
    return (
        
        <div className="flex flex-col min-h-screen xl:py-2 py-10">
            {/* Header Section */}
            <header className="w-full bg-[var(--background-color)] z-10 mb-5">
                <div className="flex flex-col">
                <Breadcrumbs role={userRole} />
                <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                    INVESTIGATION OVERSIGHT
                </h1>
                </div>
            </header>

            <BackButton />

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row flex-1 mt-2 gap-6">
                {/* Sticky Side Component */}
                <aside className="lg:sticky lg:top-10 lg:self-start w-full lg:w-1/3 bg-transparent rounded-xl overflow-y-auto">

                   { /* Dropdown to choose action: Reject Case or Assign Case */ }
                    <label htmlFor="action" className="sr-only">Choose Action</label>
                    <select
                        id="action"
                        className="bg-[var(--taupe)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold p-4 rounded-lg cursor-pointer focus:outline-none w-full"
                        defaultValue=""
                       onChange={(e) => {
                            if (e.target.value === "assign") setAssignModalOpen(true);
                            if (e.target.value === "reject") setRejectModalOpen(true);
                        }}
                    >
                        <option value="" className="bg-[var(--taupe)]" disabled>
                        Choose Action
                        </option>
                        <option value="assign" className="bg-[var(--taupe)]">Assign Case</option>
                        <option value="reject" className="bg-[var(--taupe)]">Reject Case</option>
                    </select>
                        <div className="w-full min-h-screen p-6 bg-[var(--taupe)] mt-2 rounded-lg flex flex-col justify-start">
                        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] items-start font-extrabold">Farmer Information</p>
                        <div className="mt-4 flex flex-col items-center">
                            <div className="w-50 h-50 rounded-full overflow-hidden shadow-sm">
                                <Image
                                src={imageUrl}
                                alt={`${name}'s profile picture`}
                                width={50}
                                height={50}
                                className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col mt-4 items-center justify-center">
                                {/* Farmer Name */}
                                <h1 className="font-[family-name:var(--font-montserrat)] text-lg font-black text-[var(--primary-color)]">
                                {name}
                                </h1>

                                {/* Farmer Email */}
                                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Email Address:</p>
                                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{email}</p>

                                {/* Farmer Phone Number */}
                                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Phone Number:</p>
                                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{phone}</p>
                            </div>
                        </div>
                        <hr className="my-10 border-t border-[var(--moldify-grey)]" />

                        {/* Action Buttons: Export PDF, View Identification History, View Treatment History */}
                        <div className="flex flex-col gap-2">
                            {/* Export PDF Button */}
                            <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer">
                                <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-[var(--accent-color)]" />
                                Export PDF
                            </button>

                            {/* View Identification History Button */}
                            <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer">
                                <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4 text-[var(--accent-color)]" />
                                View Identification History
                            </button>

                            {/* View Treatment History Button */}
                            <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer">
                                <FontAwesomeIcon icon={faSprayCan} className="w-4 h-4 text-[var(--accent-color)]" />
                                View Treatment History
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Scrollable Main Content */}
                <main className="flex-1 px-2 mt-2 lg:mt-0">
                    <div className="flex items-center">
                        <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] mr-5">
                            Tomato Mold
                        </h1>

                        {/* Status Boxes */}
                        <div className="flex gap-2">
                            {/*Case Status*/}
                            <StatusBox status="Pending" />
                            {/*Priority Level*/}
                            <StatusBox status="Low Priority" />
                        </div>
                    </div>
                    <div className = "flex justify-between items-center mt-3 mb-10">
                       <div className="flex flex-col">
                            <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Crop Name:</p>
                            <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">Kamatis Tagalog</h2>
                        </div>
                        <div className="flex flex-col">
                            <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Location:</p>
                            <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">Ilocos Region</h2>
                        </div>
                        <div className="flex flex-col">
                            <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Date Planted:</p>
                            <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">October 25, 2025</h2>
                        </div>
                    </div>
                     <TabBar tabs={tabs} initialIndex={0} />
                </main>
            </div>

            {/* This is the assign case Modal
            It will show if user selects the assign case option in the select input. */}
             <AssignCaseModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                mycologists={mycologists}
                onAssign={handleAssign}
            />
            {/* This is the confirmation Modal
            It will show if user selects the reject case option in the select input. */}
            <ConfirmModal
                isOpen={isRejectModalOpen}
                title="Are you sure you want to reject this case?"
                subtitle="This action is permanent and cannot be undone."
                cancelText="Cancel"
                confirmText="Yes"
                onCancel={() => setRejectModalOpen(false)}
                onConfirm={() => {
                    console.log("Case rejected!");
                    setRejectModalOpen(false);
                }}
            />
        </div>
    );
}
