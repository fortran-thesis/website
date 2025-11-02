"use client";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import TabBar from "@/components/tab_bar";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import ProfileCard from "./tab_contents/profile";
import type { ProfileData } from "./tab_contents/profile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import ChangePasswordForm, { PasswordData } from "./tab_contents/password";

export default function Settings() {
  // Separate modal states
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isPasswordSaveModalOpen, setPasswordSaveModalOpen] = useState(false);

  const userRole = "Administrator";

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "Karl Manuel",
    lastName: "Diata",
    email: "karl@gmail.com",
    role: "Administrator",
    profilePicture: "/assets/avatar-sample.jpg",
  });

  // Store pending password data before confirming
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordData | null>(null);

  // Handles text field updates
  const handleProfileChange = (updatedData: ProfileData) => {
    setProfile(updatedData);
  };

  // Shows confirm modal before saving profile
  const handleRequestSave = () => {
    setSaveModalOpen(true);
  };

  // Executes save after confirming
  const handleConfirmSave = () => {
    console.log("✅ Saved Profile:", profile);
    setSaveModalOpen(false);
  };

  // Handles uploaded file and sets it as preview
  const handleChangePicture = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setProfile((prev) => ({ ...prev, profilePicture: imageData }));
    };
    reader.readAsDataURL(file);
  };

  // Shows confirm modal for removing picture
  const handleRequestRemovePicture = () => {
    setRemoveModalOpen(true);
  };

  // Called when the user confirms “Yes” to remove profile picture
  const handleConfirmRemovePicture = () => {
    setProfile((prev) => ({ ...prev, profilePicture: undefined }));
    setRemoveModalOpen(false);
  };

  // Called when submitting password form — shows confirm modal
  const handleRequestSavePassword = (data: PasswordData) => {
    setPendingPasswordData(data);
    setPasswordSaveModalOpen(true);
  };

  // Actually saves the password after confirming
  const handleConfirmSavePassword = () => {
    if (pendingPasswordData) {
      console.log("✅ Password Updated:", pendingPasswordData);
    }
    setPasswordSaveModalOpen(false);
    setPendingPasswordData(null);
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
