"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import Image from "next/image";
import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StatusBox from "@/components/tiles/status_tile";
import UserLogTile, { UserLogTileEntry } from "@/components/tiles/user_log_tile";
import EmptyState from "@/components/empty_state";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { useUser, useAuditLogs } from '@/hooks/swr';


type UserRole = "Farmer" | "Administrator" | "Mycologist";

type UserDetails = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  is_active: boolean;
  occupation?: string;
};


export default function ViewUser() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ViewUserContent />
    </Suspense>
  );
}

function ViewUserContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  console.log('👤 ViewUser page loaded:', { userId, isUndefined: userId === "undefined", isNull: userId === null });

  const [isEditMycoModal, setShowEditMycoModal] = useState(false);

  // SWR: user details
  const { data: userSwr, isLoading: loading, error: userError } = useUser(userId ?? undefined);
  const error = userError ? (userError instanceof Error ? userError.message : 'Failed to load user') : null;

  const userDetails = useMemo(() => {
    const body = userSwr as any;
    const user = body?.data?.user || body?.user || {};
    const details = body?.data?.details || body?.details || {};
    if (!user?.username) return null;
    return {
      id: userId || '',
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: details.email || '',
      phone: details.phone_number || '',
      address: user.address || '',
      role: user.role || 'Farmer',
      is_active: !details.disabled && !user.is_banned,
      occupation: user.occupation,
    } as UserDetails;
  }, [userSwr, userId]);

  const normalizedRole = (userDetails?.role || 'Farmer').toLowerCase();
  const userRole: UserRole =
    normalizedRole === 'admin' || normalizedRole === 'administrator'
      ? 'Administrator'
      : normalizedRole === 'mycologist'
      ? 'Mycologist'
      : 'Farmer';

  // SWR: audit logs
  const { data: logsData, isLoading: logsLoading } = useAuditLogs({ limit: 10 });
  const userLogs: UserLogTileEntry[] = useMemo(() => {
    const raw = (logsData as any)?.data;
    // getAllAuditLogs returns { snapshot, nextPageToken }; getAuditLogsByAction returns array
    const entries = Array.isArray(raw) ? raw : (raw?.snapshot ?? []);
    if (!Array.isArray(entries) || entries.length === 0) return [];
    const resolveDate = (ts: any): Date | null => {
      if (!ts) return null;
      // Firestore Timestamp serialized as { _seconds, _nanoseconds }
      if (typeof ts === 'object' && '_seconds' in ts) return new Date(ts._seconds * 1000);
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    };
    const sortedEntries = [...entries].sort((left: any, right: any) => {
      const leftDate = resolveDate(left.timestamp);
      const rightDate = resolveDate(right.timestamp);
      return (rightDate?.getTime() ?? 0) - (leftDate?.getTime() ?? 0);
    });
    return sortedEntries.map((log: any) => {
      const d = resolveDate(log.timestamp);
      return {
        date: d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        time: d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        description: `${log.action || 'Unknown Action'}: ${log.description || 'No description'}`,
      };
    });
  }, [logsData]);

  const handleMycoSubmit = (data: any) => {
    setShowEditMycoModal(false);
  };

  //User Data Variables
  const userName = userDetails ? `${userDetails.firstName} ${userDetails.lastName}`.trim() || userDetails.username : "Unknown User";
  const userStatus = userDetails?.is_active ? "Active" : "Inactive";
  const username = userDetails?.username || "N/A";
  const userEmail = userDetails?.email || "N/A";
  const userPhone = userDetails?.phone || "N/A";
  const userLocation = userDetails?.address || "N/A";
  const userProfileImage = "/assets/default-fallback.png";

  // Fallback mock data if audit logs fail to load
  const defaultUserLogs: UserLogTileEntry[] = [
    { date: "Nov 2, 2025", time: "10:15 AM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Nov 1, 2025", time: "08:45 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
    { date: "Oct 31, 2025", time: "05:10 PM", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. " },
  ];

  // Show empty state if userLogs is empty array, otherwise use fetched logs
  const displayLogs = userLogs;

  const [imgSrc, setImgSrc] = useState(userProfileImage);

  const hidePersonalInfo = userRole === "Administrator";

  if (loading) {
    return (
      <main className="relative flex flex-col xl:py-2 py-10 items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">
            Loading user...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col xl:py-2 py-10 overflow-x-visible">
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

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full gap-12 items-start py-8 border-b border-[var(--primary-color)]/5">
        {/* 1. Profile Image with Accent Ring */}
        <div className="relative flex-shrink-0 group">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
            <Image
              src={imgSrc}
              alt="profile picture"
              fill
              className="object-cover"
              onError={() => setImgSrc("/assets/default-fallback.png")}
            />
          </div>
          {/* Decorative Accent Ring */}
          <div className="absolute -inset-2 border border-[var(--primary-color)]/10 rounded-full animate-[spin_20s_linear_infinite]" />
        </div>

        {/* 2. Content Section */}
        <div className="flex flex-col w-full">
          {/* Identity Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-black text-[var(--primary-color)] tracking-tighter">
                  {userName}
                </h1>
                <StatusBox status={userStatus} />
              </div>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-black uppercase tracking-[0.3em] text-[10px] opacity-40">
                User Role: {userRole === "Farmer" && userDetails?.occupation ? userDetails.occupation : userRole}
              </p>
            </div>

          
          </div>

          {/* 3. Metadata Grid: Clean & Columnar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12 p-6 bg-[var(--primary-color)]/[0.02] rounded-3xl border border-[var(--primary-color)]/[0.04]">
            
            {/* Username Field */}
            <div className="flex flex-col gap-1 border-l-2 border-[var(--accent-color)] pl-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">
                Username
              </span>
              <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                {username}
              </h2>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1 border-l-2 border-[var(--primary-color)]/10 pl-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">
                Email Address
              </span>
              <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] truncate">
                {userEmail}
              </h2>
            </div>

            {/* Phone/Location Logic */}
            {!hidePersonalInfo && (
              <>
                <div className="flex flex-col gap-1 border-l-2 border-[var(--primary-color)]/10 pl-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">
                    Contact Number
                  </span>
                  <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                    {userPhone}
                  </h2>
                </div>

                <div className="flex flex-col gap-1 border-l-2 border-[var(--primary-color)]/10 pl-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">
                    Location
                  </span>
                  <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
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
      {displayLogs.length > 0 ? (
        <UserLogTile items={displayLogs} />
      ) : (
        <EmptyState 
          icon={faClipboard}
          title="No Activity Logs Found"
          message="This user doesn't have any activity logs yet."
        />
      )}
    </main>
  );
}
