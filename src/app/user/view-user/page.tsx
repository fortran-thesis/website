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
    return entries.map((log: any) => {
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

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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
            {userRole === "Farmer" && userDetails?.occupation ? userDetails.occupation : userRole}
          </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 my-3 w-full">
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

            {/* Occupation (visible only if exists) */}
            {userDetails?.occupation && (
              <div className="flex flex-col items-center md:items-start">
                <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                  Occupation:
                </p>
                <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                  {userDetails.occupation}
                </h2>
              </div>
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
