"use client";
import { useEffect, useState, useMemo } from "react";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import TabBar from "@/components/tab_bar";
import { faLock, faUser, faBoxArchive, faHistory, faFlag } from "@fortawesome/free-solid-svg-icons";
import ProfileCard from "./tab_contents/profile";
import type { ProfileData } from "./tab_contents/profile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import ChangePasswordForm, { PasswordData } from "./tab_contents/password";
import { useAuth } from "@/hooks/useAuth";
import Archive from "./tab_contents/archive";
import CaseHistory from "./tab_contents/case-history";
import FlagHistory from "./tab_contents/flag-history";
import type { FlaggedHistory } from "@/components/tables/flagged_history_table";
import { useFlagReportsInfinite } from '@/hooks/swr';
import { apiMutate, ApiError } from '@/lib/api';

export default function Settings() {
  const { user, refreshUser } = useAuth();

  const [userRole, setUserRole] = useState<"Administrator" | "Mycologist" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isPasswordSaveModalOpen, setPasswordSaveModalOpen] = useState(false);
  const [isPasswordSaving, setPasswordSaving] = useState(false);
  const [isProfileSaving, setProfileSaving] = useState(false);

  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Administrator",
    profilePicture: undefined,
  });
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordData | null>(null);

  // ✅ Flag history via paginated SWR
  const {
    data: flagPages,
    setSize: setFlagSize,
    isLoading: flagHistoryLoading,
    isValidating: isFlagLoadingMore,
    error: flagSwrError,
  } = useFlagReportsInfinite(100);

  useEffect(() => {
    if (!flagPages || isFlagLoadingMore) return;
    const lastPage = flagPages[flagPages.length - 1];
    if (lastPage?.data?.nextPageToken) {
      setFlagSize((size) => size + 1);
    }
  }, [flagPages, isFlagLoadingMore, setFlagSize]);

  const flagHistoryError = flagSwrError ? 'Failed to load flag reports' : null;
  const flaggedHistory: FlaggedHistory[] = useMemo(() => {
    if (!flagPages) return [];
    return flagPages.flatMap((page: any) =>
      (page?.data?.snapshot ?? []).map((item: any) => {
        const createdAt = item?.dateFlagged || item?.created_at || item?.metadata?.created_at;

        let dateFlagged = 'N/A';
        if (createdAt && typeof createdAt === 'object' && '_seconds' in createdAt) {
          dateFlagged = new Date(createdAt._seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          });
        } else if (typeof createdAt === 'string' && createdAt) {
          const parsedDate = new Date(createdAt);
          dateFlagged = Number.isNaN(parsedDate.getTime())
            ? createdAt
            : parsedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              });
        }

        return {
          flagId: item.content_id || '',
          systemPredicted: item.content_type || '',
          correctedGenus: item.details || item.reason || '',
          dateFlagged,
        };
      }),
    );
  }, [flagPages]);

  const formatRole = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const handleProfileChange = (updatedData: ProfileData) => {
    console.log('📝 Profile changed:', updatedData);
    setProfile(updatedData);
  };

  useEffect(() => {
    console.log('🔍 Settings useEffect triggered, user:', user);
    if (!user) {
      console.log('⚠️ No user, returning');
      return;
    }

    const userObj = user?.user || user;
    const details = user?.details || {};
    console.log('📍 User object:', userObj, 'Details:', details);

    let firstName = userObj?.first_name || userObj?.firstName || '';
    let lastName = userObj?.last_name || userObj?.lastName || '';

    console.log('🔤 Initial firstName:', firstName, 'lastName:', lastName);

    if (!firstName && details?.displayName) {
      console.log('📋 Parsing displayName:', details.displayName);
      const parts = details.displayName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
      console.log('✅ Parsed: firstName:', firstName, 'lastName:', lastName);
    }

    const email = details?.email || '';
    const role = userObj?.role || 'User';
    const profilePicture = details?.photo_url || details?.profilePicture || undefined;

    console.log('💾 Setting profile:', { firstName, lastName, email, role, profilePicture });
    const profileData = { firstName, lastName, email, role: formatRole(role), profilePicture };
    console.log('📤 Profile data being set:', profileData);
    setProfile(profileData);
    setInitialProfile(profileData);
    const normalizedRole = (role || "").toString().toLowerCase();
    if (normalizedRole === "mycologist") {
      setUserRole("Mycologist");
    } else {
      setUserRole("Administrator");
    }
    setUserDataLoaded(true);
    setIsLoading(false);
    setProfileFile(null);
  }, [user]);

  const handleRequestSave = () => {
    setError(null);
    setSuccessMessage(null);
    const hasProfileChanges = (() => {
      if (!initialProfile) return true;
      const baseChanged =
        profile.firstName !== initialProfile.firstName ||
        profile.lastName !== initialProfile.lastName ||
        profile.email !== initialProfile.email;
      const pictureChanged = !!profileFile || profile.profilePicture !== initialProfile.profilePicture;
      return baseChanged || pictureChanged;
    })();

    if (!hasProfileChanges) {
      setError("No changes to save.");
      return;
    }

    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (isProfileSaving) return;
    setSuccessMessage(null);
    setProfileSaving(true);
    try {
      const details = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        displayName: `${profile.firstName} ${profile.lastName}`,
      };

      const formData = new FormData();
      formData.append('details', JSON.stringify(details));

      if (profileFile) {
        formData.append('photo', profileFile);
      }

      await apiMutate('/api/v1/user/profile', {
        method: 'PATCH',
        formData,
      });

      setSuccessMessage('Profile updated successfully');
      try { await refreshUser(); setProfileFile(null); } catch { /* ignore */ }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Internal error while updating profile.';
      alert('Failed to save profile: ' + message);
    } finally {
      setProfileSaving(false);
      setSaveModalOpen(false);
    }
  };

  const handleChangePicture = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setProfile((prev) => ({ ...prev, profilePicture: imageData }));
    };
    reader.readAsDataURL(file);
    setProfileFile(file);
  };

  const handleRequestRemovePicture = () => {
    setRemoveModalOpen(true);
  };

  const handleConfirmRemovePicture = () => {
    setProfile((prev) => ({ ...prev, profilePicture: undefined }));
    setProfileFile(null);
    setRemoveModalOpen(false);
  };

  const handleRequestSavePassword = (data: PasswordData) => {
    setError(null);
    setSuccessMessage(null);
    const hasPasswordChanges =
      !!data.oldPassword || !!data.newPassword || !!data.confirmNewPassword;

    if (!hasPasswordChanges) {
      setError("No changes to save.");
      return;
    }

    setPendingPasswordData(data);
    setPasswordSaveModalOpen(true);
  };

  const handleConfirmSavePassword = async () => {
    if (!pendingPasswordData) return setPasswordSaveModalOpen(false);
    if (isPasswordSaving) return;
    setError(null);
    setSuccessMessage(null);
    setPasswordSaving(true);

    try {
      const body = {
        oldPassword: pendingPasswordData.oldPassword,
        newPassword: pendingPasswordData.newPassword,
      };

      const res = await apiMutate<any>('/api/v1/auth/change-password', {
        method: 'POST',
        body,
      });

      setSuccessMessage(res?.data || res?.message || 'Password updated successfully');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Internal error while changing password.';
      setError(`Failed to change password: ${message}`);
    } finally {
      setPasswordSaving(false);
      setPasswordSaveModalOpen(false);
      setPendingPasswordData(null);
    }
  };

  const getTabsByRole = () => {
    const baseTabs = [
      {
        label: "Profile",
        icon: faUser,
        content: (
          <ProfileCard
            data={profile}
            onChange={handleProfileChange}
            onSave={handleRequestSave}
            onChangePicture={handleChangePicture}
            onRemovePicture={handleRequestRemovePicture}
            isLoading={isProfileSaving}
          />
        ),
      },
      {
        label: "Password",
        icon: faLock,
        content: (
          <ChangePasswordForm
            onSave={handleRequestSavePassword}
            onError={setError}
            isLoading={isPasswordSaving}
          />
        ),
      },
    ];

    const mycologistOnlyTabs = [
      {
        label: "Archive",
        icon: faBoxArchive,
        content: <Archive />,
      },
      {
        label: "Case History",
        icon: faHistory,
        content: <CaseHistory />,
      },
      {
        label: "Flag History",
        icon: faFlag,
        content: (
          <FlagHistory
            flaggedHistory={flaggedHistory}
            isLoading={flagHistoryLoading}
            error={flagHistoryError}
          />
        ),
      },
    ];

    if (userRole === "Mycologist") {
      return [...baseTabs, ...mycologistOnlyTabs];
    }

    return baseTabs;
  };

  const tabs = getTabsByRole();

  console.log('🟡 Current profile state:', profile);

  return (
    <main
      className={`relative flex flex-col xl:py-2 py-10 w-full ${
        isProfileSaving || isPasswordSaving ? "cursor-wait pointer-events-none" : ""
      }`}
      aria-busy={isProfileSaving || isPasswordSaving}
    >
      {(isProfileSaving || isPasswordSaving) && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
            style={{ width: "30%" }}
          />
        </div>
      )}

      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole || "Administrator"} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            SETTINGS
          </h1>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs text-left lg:text-left">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 p-6 text-center">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)]">
            Loading settings...
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10">
            <TabBar tabs={tabs} initialIndex={0} />
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={isRemoveModalOpen}
        title="Remove Profile Picture?"
        subtitle="Are you sure you want to remove your profile picture?"
        cancelText="Cancel"
        confirmText="Yes, Remove"
        onCancel={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemovePicture}
      />

      <ConfirmModal
        isOpen={isSaveModalOpen}
        title="Save Changes?"
        subtitle="Do you want to save your recent profile changes?"
        cancelText="Cancel"
        confirmText="Save"
        confirmLoadingText="Saving..."
        confirmDisabled={isProfileSaving}
        onCancel={() => setSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <ConfirmModal
        isOpen={isPasswordSaveModalOpen}
        title="Save Password Changes?"
        subtitle="Do you want to save your recent password changes?"
        cancelText="Cancel"
        confirmText="Save"
        confirmLoadingText="Saving..."
        confirmDisabled={isPasswordSaving}
        onCancel={() => setPasswordSaveModalOpen(false)}
        onConfirm={handleConfirmSavePassword}
      />
    </main>
  );
}