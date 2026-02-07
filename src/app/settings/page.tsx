"use client";
import { useEffect, useState } from "react";
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

export default function Settings() {
  const { user, refreshUser } = useAuth();
  // State for tracking user role fetched from backend
  const [userRole, setUserRole] = useState<"Administrator" | "Mycologist" | null>(null);
  
  // State for handling loading and error states during role fetch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Separate modal states for different actions
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isPasswordSaveModalOpen, setPasswordSaveModalOpen] = useState(false);
  const [isPasswordSaving, setPasswordSaving] = useState(false);
  const [isProfileSaving, setProfileSaving] = useState(false);
  
  // Track if we've loaded user data from useAuth (not just browser load)
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Administrator",
    profilePicture: undefined,
  });
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(null);

  // Keep the raw file for uploading via multipart/form-data
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Store pending password data before confirming
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordData | null>(null);

  const formatRole = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };


  // Handles text field updates
  const handleProfileChange = (updatedData: ProfileData) => {
    console.log('📝 Profile changed:', updatedData);
    setProfile(updatedData);
  };

  // Initialize profile state from authenticated user data if available
  useEffect(() => {
    console.log('🔍 Settings useEffect triggered, user:', user);
    if (!user) {
      console.log('⚠️ No user, returning');
      return;
    }
    
    // Backend returns nested structure: {user: {...}, details: {...}}
    const userObj = user?.user || user;
    const details = user?.details || {};
    console.log('📍 User object:', userObj, 'Details:', details);
    
    // Extract name fields from user object (backend uses snake_case)
    let firstName = userObj?.first_name || userObj?.firstName || '';
    let lastName = userObj?.last_name || userObj?.lastName || '';
    
    console.log('🔤 Initial firstName:', firstName, 'lastName:', lastName);
    
    // If we only have displayName, parse it
    if (!firstName && details?.displayName) {
      console.log('📋 Parsing displayName:', details.displayName);
      const parts = details.displayName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
      console.log('✅ Parsed: firstName:', firstName, 'lastName:', lastName);
    }
    
    // Email comes from details object
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
    // Also clear any pending profile file
    setProfileFile(null);
  }, [user]);

  // Shows confirm modal before saving profile
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

  // Executes save after confirming
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
      
      // CRITICAL: Append details as stringified JSON
      formData.append('details', JSON.stringify(details));
      
      // Add file if present
      if (profileFile) {
        formData.append('photo', profileFile);
      }

      console.log('📤 Sending PATCH with FormData:', { 
        details, 
        hasFile: !!profileFile,
        fileName: profileFile?.name 
      });

      // DO NOT set Content-Type header - let browser handle it
      const res = await fetch('/api/v1/user/profile', { 
        method: 'PATCH', 
        body: formData, 
        credentials: 'include' 
      });

      if (!res.ok) {
        const text = await res.text();
        console.log('❌ PATCH error response:', res.status, text);
        let json;
        try { json = JSON.parse(text); } catch { json = { error: text }; }
        alert('Failed to save profile: ' + (json?.message || json?.error || res.statusText));
      } else {
        const data = await res.json();
        console.log('Profile updated', data);
        setSuccessMessage('Profile updated successfully');
        try { await refreshUser(); setProfileFile(null); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Internal error while updating profile.');
    } finally {
      setProfileSaving(false);
      setSaveModalOpen(false);
    }
  };

  // Handles uploaded file and sets it as preview
  const handleChangePicture = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setProfile((prev) => ({ ...prev, profilePicture: imageData }));
    };
    reader.readAsDataURL(file);
    setProfileFile(file);
  };

  // Shows confirm modal for removing picture
  const handleRequestRemovePicture = () => {
    setRemoveModalOpen(true);
  };

  // Called when the user confirms “Yes” to remove profile picture
  const handleConfirmRemovePicture = () => {
    setProfile((prev) => ({ ...prev, profilePicture: undefined }));
    setProfileFile(null);
    setRemoveModalOpen(false);
  };

  // Called when submitting password form — shows confirm modal
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

  // Actually saves the password after confirming
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

      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { error: text }; }

      if (!res.ok) {
        setError(`Failed to change password: ${json?.message || json?.error || res.statusText}`);
      } else {
        setSuccessMessage(json?.data || json?.message || 'Password updated successfully');
      }
    } catch (err) {
      console.error('Change password error', err);
      setError('Internal error while changing password.');
    } finally {
      setPasswordSaving(false);
      setPasswordSaveModalOpen(false);
      setPendingPasswordData(null);
    }
  };

  /**
   * Build tabs based on user role
   * - Administrator: Profile and Password tabs
   * - Mycologist: Profile, Password, Archive, Case History, and Flag History tabs
   */
  const getTabsByRole = () => {
    // Base tabs available to all roles
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

    // Additional tabs for Mycologist role
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
        content: <FlagHistory />,
      },
    ];

    // Return tabs based on detected user role
    if (userRole === "Mycologist") {
      return [...baseTabs, ...mycologistOnlyTabs];
    }

    // Default to Administrator tabs (Profile and Password only)
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
      {/* Header Section */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole || "Administrator"} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            SETTINGS
          </h1>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message Display */}
      {successMessage && (
        <div className="mt-4 mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs text-left lg:text-left">
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="mt-10 p-6 text-center">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)]">
            Loading settings...
          </p>
        </div>
      ) : (
        <>
          {/* Tab Section - Only renders when user role is fetched */}
          <div className="mt-10">
            <TabBar tabs={tabs} initialIndex={0} />
          </div>
        </>
      )}

      {/* Remove Picture Modal */}
      <ConfirmModal
        isOpen={isRemoveModalOpen}
        title="Remove Profile Picture?"
        subtitle="Are you sure you want to remove your profile picture?"
        cancelText="Cancel"
        confirmText="Yes, Remove"
        onCancel={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemovePicture}
      />

      {/* Save Profile Changes Modal */}
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

      {/* Save Password Changes Modal */}
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
