"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import Image from "next/image";
import { useState } from "react";
import StatusBox from "@/components/tiles/status_tile";
import UserLogTile, { UserLogTileEntry } from "@/components/tiles/user_log_tile";


type UserRole = "Farmer" | "Administrator" | "Mycologist";
const userRole: UserRole = "Farmer"; 


export default function ViewUser({ src }: { src?: string }) {
  const [isEditMycoModal, setShowEditMycoModal] = useState(false);

  const handleMycoSubmit = (data: any) => {
    setShowEditMycoModal(false);
  };

  //User Data Variables
  const userName = "Faith Gabrielle Gamboa";
  const userStatus = "Active";
  const username = "lauren123";
  const userEmail = "lauren@gmail.com";
  const userPhone = "09674306842";
  const userLocation = "Ilocos Region";
  const userProfileImage = "/assets/sdssdsd.jpg";

  //Activity Log Data
  const userLogs: UserLogTileEntry[] = [
    { date: "Nov 2, 2025", time: "10:15 AM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Nov 1, 2025", time: "08:45 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Oct 31, 2025", time: "05:10 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Nov 2, 2025", time: "10:15 AM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Nov 1, 2025", time: "08:45 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Oct 31, 2025", time: "05:10 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
  ];

  const [imgSrc, setImgSrc] = useState(src || userProfileImage);

  const hidePersonalInfo =
    userRole === "Administrator" || userRole === "Mycologist";

  return (
    <main className="relative flex flex-col xl:py-2 py-10 overflow-x-auto">
      {/* Header Section */}
      <div className="flex flex-row justify-between mb-10">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            USER MANAGEMENT
          </h1>
        </div>
      </div>
      {/* End Header Section */}
      <BackButton />

      <div className="flex flex-col md:flex-row w-full gap-x-4 items-center">
        <div className="w-50 aspect-square rounded-full overflow-hidden shadow-sm flex-shrink-0 relative">
          <Image
            src={imgSrc}
            alt="profile picture"
            fill
            className="object-cover rounded-full"
            onError={() => setImgSrc("/assets/default-fallback.png")}
          />
        </div>

        <div className="flex flex-col items-center md:items-start justify-center w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start mb-2">
            <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] mr-5">
              {userName}
            </h1>
            <StatusBox status={userStatus} />
          </div>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-sm mr-5">
            {userRole}
          </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 my-3 w-full">
            {/* Username */}
            <div className="flex flex-col items-center md:items-start">
              <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                Username:
              </p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                {username}
              </h2>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center md:items-start">
              <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                Email:
              </p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                {userEmail}
              </h2>
            </div>

            {/* Phone Number & Location (visible only if not admin/mycologist) */}
            {!hidePersonalInfo && (
              <>
                <div className="flex flex-col items-center md:items-start">
                  <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                    Phone Number:
                  </p>
                  <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                    {userPhone}
                  </h2>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                    Location:
                  </p>
                  <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                    {userLocation}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-extrabold mt-10 mb-5">
        Activity Log
      </p>
      <UserLogTile items={userLogs} />
    </main>
  );
}
