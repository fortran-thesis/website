"use client";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCalendar } from '@fortawesome/free-solid-svg-icons';
import StatisticsTile from '@/components/tiles/statistics_tile';

export default function Home() {
    // Dummy user object for demonstration; replace with actual user data as needed
    const user = {
        profileImageUrl: "/assets/Wrong_Image1.png",
        name: "Karl Manuel Diata",
        role: "Administrator"
    };
    const notification = 2; // Example notification count

    const MoldDashboard = 'assets/Mold_Dashboard.svg';
    const MoldDashboard1 = 'assets/Mold_Dashboard1.svg';

    return (
        <main className="relative flex flex-col sm:py-2 py-10">
            {/* Background Image Behind Content */}

            {/* Header Section */}
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-regular text-sm">
                        Temporary Bread Crumbs
                    </p>
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        DASHBOARD
                    </h1>
                </div>

                <div className="w-full flex flex-row justify-end items-center gap-x-10 lg:gap-x-20">
                    {/* Notification Bell with Badge */}
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faBell}
                            className="text-[var(--primary-color)] ml-5 mt-1 cursor-pointer hover:text-[var(--hover-primary)] transition"
                            style={{ width: '24px', height: '24px' }}
                        />
                        {notification > 0 && (
                            <span className="absolute bottom-1/2 right-0 block h-2 w-2 rounded-full ring-2 ring-[var(--background-color)] bg-[var(--moldify-red)]"></span>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex gap-x-2 items-center">
                        <img
                            src={user?.profileImageUrl || "/assets/FallBack_Image.png"}
                            alt="Profile picture"
                            width={40}
                            height={40}
                            className="rounded-full shadow-md"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/assets/FallBack_Image.png";
                            }}
                        />
                        <div className="hidden lg:flex flex-col">
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm">
                                {user?.name || "Unknown User"}
                            </p>
                            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-xs">
                                {user?.role || "Unknown Role"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Header Section */}
            
                                
        </main>
    );
}
