"use client";

import { useState } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import TabBar from "@/components/tab_bar";
import StatusBox from "@/components/tiles/status_tile";
import AssignCaseModal from "@/components/modals/assign_case_modal";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { faSeedling, faClipboardList, faClockRotateLeft, faFilePdf, faFlask, faSprayCan, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaseDetailsTab from "../investigation-tabs/case_details";
import InVitroTab from "../investigation-tabs/in_vitro";
import InVivoTab from "../investigation-tabs/in_vivo";
import AddTreatmentModal from "@/components/modals/add_treatment_modal";

type Mycologist = {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
};

const mycologists: Mycologist[] = [
  { name: "Dr. Lisa Wong", status: "available", cases: 4 },
  { name: "Dr. John Doe", status: "at-capacity", cases: 8 },
  { name: "Dr. Jane Smith", status: "available", cases: 2 },
];

export default function Investigation() {
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isConfirmAssignOpen, setConfirmAssignOpen] = useState(false);
  const [isAddTreatmentOpen, setAddTreatmentOpen] = useState(false);
  const [assignedMycologist, setAssignedMycologist] = useState<string | null>(null);
  const [isRejected, setIsRejected] = useState(false);

  const [pendingAssign, setPendingAssign] = useState<{ mycologist: Mycologist; priority: string; endDate: Date | null } | null>(null);

  // Called from AssignCaseModal -> opens confirmation modal
  const handleAssignClick = (mycologist: Mycologist, priority: string, endDate: Date | null) => {
    setPendingAssign({ mycologist, priority, endDate });
    setConfirmAssignOpen(true);
  };

  // Called from confirmation modal -> finalize assignment
  const handleConfirmAssign = () => {
    if (!pendingAssign) return;
    setAssignedMycologist(pendingAssign.mycologist.name);
    console.log("Assigned to:", pendingAssign.mycologist, pendingAssign.priority, pendingAssign.endDate);
    setPendingAssign(null);
    setConfirmAssignOpen(false);
    setAssignModalOpen(false);
  };

  const handleReject = () => {
    console.log("Case rejected!");
    setIsRejected(true);
    setRejectModalOpen(false);
  };

  type UserRole = "Administrator" | "Mycologist";

  const [userRole, setUserRole] = useState<UserRole>("Administrator");
  const imageUrl = "/profile-placeholder.png";
  const name = "Lauren Bishmilla";
  const email = "laurenbishmilla@gmail.com";
  const phone = "09674306842";

  // Tabs
  const tabs = [
    {
      label: "Case Details",
      icon: faClipboardList,
      content: (
        <CaseDetailsTab
          entries={[
            { 
              date: "October 2, 2025 • 09:14 PM", 
              notes: "Observed white spots on leaves.", 
              images: ["/assets/moldify-logo-v3.svg", "/sample2.jpg"] 
            },
            { 
              date: "October 2, 2025 • 09:14 PM", 
              notes: "Observed white spots on leaves.", 
              images: ["/assets/moldify-logo-v3.svg", "/sample2.jpg", "/assets/moldify-logo-v3.svg"] 
            },
          ]}
        />
      ),
    },
    {
      label: "In Vitro",
      icon: faFlask,
      content: (
        <InVitroTab
          dateTime="Last Updated: November 01, 2025 • 10:00 AM"
          growthMedium="Potato Dextrose Agar (PDA)"
          incubationTemperature="25°C"
          inVitroEntries={[
            { 
              date: "November 01, 2025 • 10:00 AM", 
              imagePath: "/images/sample1.jpg", 
              sizeValue: "5 mm", 
              colorValue: "White", 
              notes: "Colony growing steadily." 
            },
            { 
              date: "November 01, 2025 • 10:00 AM", 
              imagePath: "/images/sample2.jpg", 
              sizeValue: "7 mm", 
              colorValue: "Cream", 
              notes: "Some contamination observed." 
            },
          ]}
        />
      ),
    },
    {
      label: "In Vivo",
      icon: faSeedling,
      content: (
        <InVivoTab
          dateTime="Last Updated: November 01, 2025 • 10:00 AM"
          environmentalTemperature="30°C"
          inVivoEntries={[
            { 
              date: "November 01, 2025 • 10:00 AM", 
              imagePath: "/images/sample1.jpg", 
              sizeValue: "5 mm", 
              colorValue: "White", 
              notes: "Colony growing steadily." 
            },
            { 
              date: "November 01, 2025 • 10:00 AM", 
              imagePath: "/images/sample2.jpg", 
              sizeValue: "7 mm", 
              colorValue: "Cream", 
              notes: "Some contamination observed." 
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen xl:py-2 py-10">
      {/* Header */}
      <header className="w-full bg-[var(--background-color)] z-10 mb-5">
        <Breadcrumbs role={userRole} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
          INVESTIGATION OVERSIGHT
        </h1>
      </header>

      <BackButton />

      <div className="flex flex-col lg:flex-row flex-1 mt-2 gap-6">

        <aside className="lg:sticky lg:top-10 lg:self-start w-full lg:w-1/3 bg-transparent rounded-xl overflow-y-auto">
          {userRole !== "Mycologist" && !assignedMycologist && (
            <select
              id="action"
              className={`bg-[var(--taupe)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold p-4 rounded-lg cursor-pointer focus:outline-none w-full
              ${isRejected ? "opacity-50 cursor-not-allowed" : ""}`}
              defaultValue=""
              onChange={(e) => {
                if (isRejected) return;
                if (e.target.value === "assign") setAssignModalOpen(true);
                if (e.target.value === "reject") setRejectModalOpen(true);
              }}
              disabled={isRejected}
            >
              <option value="" disabled>Choose Action</option>
              <option value="assign">Assign Case</option>
              <option value="reject">Reject Case</option>
            </select>
          )}

          {assignedMycologist && (
            <p className="mt-4 p-4 rounded-lg bg-[var(--taupe)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] text-sm font-semibold">
              Assigned to: {assignedMycologist}
            </p>
          )}

          {/* Farmer Info */}
          <div className="w-full min-h-screen p-6 bg-[var(--taupe)] mt-2 rounded-lg flex flex-col justify-start">
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] items-start font-extrabold">
              Farmer Information
            </p>
            <div className="mt-4 flex flex-col items-center">
              <div className="w-50 h-50 rounded-full overflow-hidden shadow-sm">
                <Image src={imageUrl} alt={`${name}'s profile picture`} width={50} height={50} className="object-cover w-full h-full" />
              </div>
              <div className="flex flex-col mt-4 items-center justify-center">
                <h1 className="font-[family-name:var(--font-montserrat)] text-lg font-black text-[var(--primary-color)]">{name}</h1>
                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Email Address:</p>
                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{email}</p>
                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Phone Number:</p>
                <p className="text-sm font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">{phone}</p>
              </div>
            </div>
            <hr className="my-8 border-t border-[var(--moldify-grey)]" />

            <div className="flex flex-col gap-2">
             {userRole !== "Administrator" && (
                <button 
                  className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
                  onClick={() => setAddTreatmentOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-[var(--accent-color)]" /> Add Treatment
                </button>
              )}
              <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer">
                <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-[var(--accent-color)]" /> Export PDF
              </button>
                <button
                className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
                onClick={() => (window.location.href = "/investigation/identification-history")}
                >
                <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4 text-[var(--accent-color)]" /> View Identification History
                </button>
              <button className="flex items-center gap-2 text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] p-4 rounded-lg hover:bg-[var(--moldify-black)]/10 transition cursor-pointer"
              onClick={() => (window.location.href = "/investigation/treatment-history")}
              >
                <FontAwesomeIcon icon={faSprayCan} className="w-4 h-4 text-[var(--accent-color)]" /> View Treatment History
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-2 mt-2 lg:mt-0">
          <div className="flex items-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] mr-5">Tomato Mold</h1>
            <div className="flex gap-2">
              <StatusBox status="Pending" />
              <StatusBox status="Low Priority" />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 mb-10">
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

      {/* Modals */}
      <AssignCaseModal
        isOpen={isAssignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        mycologists={mycologists}
        onAssign={handleAssignClick}
      />

      <ConfirmModal
        isOpen={isRejectModalOpen}
        title="Are you sure you want to reject this case?"
        subtitle="This action is permanent and cannot be undone."
        cancelText="Cancel"
        confirmText="Yes"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />

      <ConfirmModal
        isOpen={isConfirmAssignOpen}
        title={`Are you sure you want to assign this case to ${pendingAssign?.mycologist.name}?`}
        subtitle="This action is irreversible."
        cancelText="Cancel"
        confirmText="Yes, Assign"
        onCancel={() => setConfirmAssignOpen(false)}
        onConfirm={handleConfirmAssign}
      />
      <AddTreatmentModal
        isOpen={isAddTreatmentOpen}
        onClose={() => setAddTreatmentOpen(false)}
      />
    </div>
  );
}
