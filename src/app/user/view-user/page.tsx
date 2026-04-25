"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import Image from "next/image";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBox from "@/components/tiles/status_tile";
import UserLogTile, { UserLogTileEntry } from "@/components/tiles/user_log_tile";
import EmptyState from "@/components/empty_state";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { useUser, useAuditLogs } from '@/hooks/swr';
import PageLoading from "@/components/loading/page_loading";
import MessageBanner from "@/components/feedback/message_banner";
import { resolveAuditLogRedirect } from "@/lib/redirect-resolver";


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
    <Suspense fallback={<PageLoading fullScreen showTopBar />}>
      <ViewUserContent />
    </Suspense>
  );
}

function ViewUserContent() {
  const router = useRouter();
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
  const { data: logsData, isLoading: logsLoading } = useAuditLogs({ userId: userId ?? undefined, limit: 20 });
  const userLogs: UserLogTileEntry[] = useMemo(() => {
    const raw = (logsData as any)?.data;
    // getAllAuditLogs returns { snapshot, nextPageToken }; getAuditLogsByAction returns array
    const entries = Array.isArray(raw) ? raw : (raw?.snapshot ?? []);
    if (!Array.isArray(entries) || entries.length === 0) return [];

    const userIdentifiers = [
      userId,
      userDetails?.id,
      userDetails?.username,
      userDetails?.email,
      userDetails?.firstName && userDetails?.lastName
        ? `${userDetails.firstName} ${userDetails.lastName}`
        : undefined,
      userDetails?.firstName,
      userDetails?.lastName,
    ]
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => value.toLowerCase());

    const getCandidateFields = (log: any): string[] => {
      const meta = log?.metadata ?? {};
      const actor = log?.actor ?? {};
      const target = log?.target ?? {};
      const user = log?.user ?? {};

      return [
        log?.user_id,
        log?.uid,
        log?.username,
        log?.email,
        log?.performed_by,
        log?.performed_by_id,
        log?.actor_id,
        log?.target_user_id,
        log?.targetUserId,
        log?.reference,
        actor?.id,
        actor?.user_id,
        actor?.uid,
        actor?.username,
        target?.id,
        target?.user_id,
        target?.uid,
        target?.username,
        user?.id,
        user?.user_id,
        user?.uid,
        user?.username,
        meta?.user_id,
        meta?.uid,
        meta?.actor_id,
        meta?.performed_by,
        meta?.target_user_id,
        meta?.reference,
      ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.toLowerCase());
    };

    const filteredEntries = entries.filter((log: any) => {
      if (userIdentifiers.length === 0) return true;

      const candidates = getCandidateFields(log);
      if (candidates.some((field) => userIdentifiers.includes(field))) return true;

      const desc = `${log?.description ?? ''}`.toLowerCase();
      return userIdentifiers.some((id) => id.length > 2 && desc.includes(id));
    });

    if (filteredEntries.length === 0) return [];

    const resolveDate = (ts: any): Date | null => {
      if (!ts) return null;
      // Firestore Timestamp serialized as { _seconds, _nanoseconds }
      if (typeof ts === 'object' && '_seconds' in ts) return new Date(ts._seconds * 1000);
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    };
    const sortedEntries = [...filteredEntries].sort((left: any, right: any) => {
      const leftDate = resolveDate(left.timestamp);
      const rightDate = resolveDate(right.timestamp);
      return (rightDate?.getTime() ?? 0) - (leftDate?.getTime() ?? 0);
    });
    const toNonEmptyString = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    return sortedEntries.map((log: any) => {
      const d = resolveDate(log.timestamp);
      const action = toNonEmptyString(log.action) || 'Unknown Action';
      const targetId =
        toNonEmptyString(log.target_id) ||
        toNonEmptyString(log.targetId) ||
        toNonEmptyString(log.reference) ||
        toNonEmptyString(log?.target?.id) ||
        toNonEmptyString(log?.metadata?.reference);

      return {
        date: d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        time: d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        description: `${action}: ${log.description || 'No description'}`,
        href: resolveAuditLogRedirect(action, targetId),
      };
    });
  }, [logsData, userDetails, userId]);

  const handleLogClick = (entry: UserLogTileEntry) => {
    if (!entry.href) return;
    router.push(entry.href);
  };

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

  // Show empty state if userLogs is empty array, otherwise use fetched logs
  const displayLogs = userLogs;

  const [imgSrc, setImgSrc] = useState(userProfileImage);

  const hidePersonalInfo = userRole === "Administrator";

  if (loading) {
    return <PageLoading message="Loading user..." fullScreen />;
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
        <MessageBanner variant="error" className="mb-6">
          {error}
        </MessageBanner>
      )}

      <div className="flex flex-col lg:flex-row w-full gap-12 items-center lg:items-start py-12 border-b border-[var(--primary-color)]/10">
        {/* 1. Profile Image: Typography-First Minimalism */}
        <div className="relative flex-shrink-0 group">
          <div className="w-44 h-44 rounded-full p-1 bg-[var(--primary-color)]/[0.03] border border-[var(--primary-color)]/[0.08] relative z-10 transition-all duration-700 group-hover:border-[var(--primary-color)]/30">
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all">
              <Image
                src={imgSrc}
                alt={`${userName}'s profile`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
                onError={() => setImgSrc("/assets/default-fallback.png")}
              />
            </div>
          </div>
          
          {/* Subtle Hover Anchor: A minimal geometric point for technical impact */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
            <div className="w-[1px] h-4 bg-gradient-to-t from-[var(--primary-color)] to-transparent" />
          </div>
        </div>

        {/* 2. Content Section */}
        <div className="flex flex-col w-full text-center lg:text-left">
          {/* Identity Row */}
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <h1 className="font-[family-name:var(--font-montserrat)] text-5xl font-black text-[var(--primary-color)] tracking-tighter leading-none">
                {userName}
              </h1>
              <div className="flex justify-center lg:justify-start">
                <StatusBox status={userStatus} />
              </div>
            </div>
            
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-black uppercase tracking-[0.45em] text-xs">
              Role: {userRole === "Farmer" && userDetails?.occupation ? userDetails.occupation : userRole}
            </p>
          </div>

          {/* 3. Metadata Grid: Clean & Columnar Typography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 rounded-[2rem] overflow-hidden bg-[var(--primary-color)]/[0.02] border border-[var(--primary-color)]/[0.08] backdrop-blur-sm">
            
            {/* Username Field */}
            <div className="flex flex-col gap-2 p-8 border-b sm:border-b-0 sm:border-r border-[var(--primary-color)]/[0.08] hover:bg-[var(--primary-color)]/[0.02] transition-colors group/cell">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/90 group-hover/cell:text-[var(--primary-color)] transition-colors">
                Username
              </span>
              <h2 className="text-[16px] font-bold text-[var(--moldify-black)] font-[family-name:var(--font-montserrat)] tracking-tight">
                {username}
              </h2>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2 p-8 border-b xl:border-b-0 xl:border-r border-[var(--primary-color)]/[0.08] hover:bg-[var(--primary-color)]/[0.02] transition-colors group/cell">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/90 group-hover/cell:text-[var(--primary-color)] transition-colors">
                Email
              </span>
              <h2 className="text-[16px] font-bold text-[var(--moldify-black)] font-[family-name:var(--font-montserrat)] truncate tracking-tight">
                {userEmail}
              </h2>
            </div>

            {!hidePersonalInfo && (
              <>
                {/* Phone Field */}
                <div className="flex flex-col gap-2 p-8 border-b sm:border-b-0 sm:border-r border-[var(--primary-color)]/[0.08] hover:bg-[var(--primary-color)]/[0.02] transition-colors group/cell">
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/90 group-hover/cell:text-[var(--primary-color)] transition-colors">
                    Phone Number
                  </span>
                  <h2 className="text-[16px] font-bold text-[var(--moldify-black)] font-[family-name:var(--font-montserrat)] tracking-tight">
                    {userPhone}
                  </h2>
                </div>

                {/* Location Field */}
                <div className="flex flex-col gap-2 p-8 hover:bg-[var(--primary-color)]/[0.02] transition-colors group/cell">
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/90 group-hover/cell:text-[var(--primary-color)] transition-colors">
                    Location
                  </span>
                  <h2 className="text-[16px] font-bold text-[var(--moldify-black)] font-[family-name:var(--font-montserrat)] tracking-tight">
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
      {logsLoading && <PageLoading message="Loading activity log..." compact />}
      {displayLogs.length > 0 ? (
        <UserLogTile items={displayLogs} onItemClick={handleLogClick} />
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
