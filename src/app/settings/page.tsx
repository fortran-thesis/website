"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import TabBar from "@/components/tab_bar";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import ProfileCard from "./tab_contents/profile";
import type { ProfileData } from "./tab_contents/profile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import ChangePasswordForm, { PasswordData } from "./tab_contents/password";

export default function Settings() {
  const { user, loading, refreshUser } = useAuth();
  console.log('🟡 Settings component rendering, user:', user, 'loading:', loading);
  
  // Separate modal states
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isPasswordSaveModalOpen, setPasswordSaveModalOpen] = useState(false);
  
  // Track if we've loaded user data from useAuth (not just browser load)
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const userRole = "Administrator";

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Administrator",
    profilePicture: undefined,
  });

  // Keep the raw file for uploading via multipart/form-data
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Store pending password data before confirming
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordData | null>(null);

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
    const profileData = { firstName, lastName, email, role, profilePicture };
    console.log('📤 Profile data being set:', profileData);
    setProfile(profileData);
    setUserDataLoaded(true);
    // Also clear any pending profile file
    setProfileFile(null);
  }, [user]);

  // Shows confirm modal before saving profile
  const handleRequestSave = () => {
    setSaveModalOpen(true);
  };

  // Executes save after confirming
  const handleConfirmSave = async () => {
    try {
      const details = {
        firstName: profile.firstName,
        lastName: profile.lastName,
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
        alert('Profile updated successfully');
        try { await refreshUser(); setProfileFile(null); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Internal error while updating profile.');
    } finally {
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
    setPendingPasswordData(data);
    setPasswordSaveModalOpen(true);
  };

  // Actually saves the password after confirming
  const handleConfirmSavePassword = async () => {
    if (!pendingPasswordData) return setPasswordSaveModalOpen(false);

    try {
      const body = {
        old_password: pendingPasswordData.oldPassword,
        new_password: pendingPasswordData.newPassword,
      };

      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = { error: text }; }
        alert(`Failed to change password: ${json?.message || json?.error || res.statusText}`);
      } else {
        alert('Password updated successfully');
      }
    } catch (err) {
      console.error('Change password error', err);
      alert('Internal error while changing password.');
    } finally {
      setPasswordSaveModalOpen(false);
      setPendingPasswordData(null);
    }
  };

  const tabs = [
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
        />
      ),
    },
    {
      label: "Password",
      icon: faLock,
      content: <ChangePasswordForm onSave={handleRequestSavePassword} />,
    },
  ];

  console.log('🟡 Current profile state:', profile);

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
      {/* Header Section */}
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            SETTINGS
          </h1>
        </div>
      </div>

      {/* Tab Section */}
      <div className="mt-10">
        {!userDataLoaded && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            Loading your profile data...
          </div>
        )}
        <TabBar tabs={tabs} initialIndex={0} />
      </div>

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
        onCancel={() => setPasswordSaveModalOpen(false)}
        onConfirm={handleConfirmSavePassword}
      />
    </main>
  );
}
