"use client";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import TabBar from "@/components/tab_bar";
import { faLock, faUser, faBoxArchive, faHistory, faFlag } from "@fortawesome/free-solid-svg-icons";
import ProfileCard from "./tab_contents/profile";
import type { ProfileData } from "./tab_contents/profile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import ChangePasswordForm, { PasswordData } from "./tab_contents/password";
import { endpoints } from "@/services/endpoints";
import { apiClient } from "@/services/apiClient";
import Archive from "./tab_contents/archive";
import CaseHistory from "./tab_contents/case-history";
import FlagHistory from "./tab_contents/flag-history";

export default function Settings() {
  // State for tracking user role fetched from backend
  const [userRole, setUserRole] = useState<"Administrator" | "Mycologist" | null>(null);
  
  // State for handling loading and error states during role fetch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate modal states for different actions
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [isPasswordSaveModalOpen, setPasswordSaveModalOpen] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "Karl Manuel",
    lastName: "Diata",
    email: "karl@gmail.com",
    role: "Administrator",
    profilePicture: "/assets/avatar-sample.jpg",
  });

  // Store pending password data before confirming
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordData | null>(null);

  /**
   * Fetch current user's role from backend API
   * This determines which tab contents are displayed to the user
   * Administrator users see: Profile, Password
   * Mycologist users see: Profile, Password, Archive, Case History, Flag History
   */
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Uncomment this when backend server is ready
        // Fetch user profile data from backend
        // const response = await apiClient.get(endpoints.user.profile);

        // if (response.success && response.data) {
        //   // Extract role from response and validate
        //   const fetchedRole = response.data.role as "Administrator" | "Mycologist";
        //   
        //   // Validate that role is one of the expected values
        //   if (fetchedRole === "Administrator" || fetchedRole === "Mycologist") {
        //     setUserRole(fetchedRole);
        //     // Update profile with fetched data
        //     setProfile((prev) => ({
        //       ...prev,
        //       ...response.data,
        //     }));
        //   } else {
        //     throw new Error(`Unknown user role: ${fetchedRole}`);
        //   }
        // } else {
        //   throw new Error(response.error || "Failed to fetch user profile");
        // }

        // TEMPORARY: Set default role to Administrator for development
        // Users can manually change this using the role selector below
        setUserRole("Administrator");
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError(err instanceof Error ? err.message : "Failed to load user settings");
        // Default to Administrator role if fetch fails for safety
        setUserRole("Administrator");
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch user role on component mount
    fetchUserRole();
  }, []);

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
    console.log("Saved Profile:", profile);
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
      console.log("Password Updated:", pendingPasswordData);
    }
    setPasswordSaveModalOpen(false);
    setPendingPasswordData(null);
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
          />
        ),
      },
      {
        label: "Password",
        icon: faLock,
        content: <ChangePasswordForm onSave={handleRequestSavePassword} />,
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

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
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

      {/* DEVELOPMENT: Manual Role Selector - Remove when backend server is ready */}
      {!isLoading && (
        <div className="mt-6 p-4 bg-[var(--taupe)] rounded-lg border-2 border-[var(--primary-color)]">
          <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-sm mb-3">
            Development: Select User Role
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setUserRole("Administrator")}
              className={`px-4 py-2 rounded-lg font-[family-name:var(--font-bricolage-grotesque)] text-sm transition ${
                userRole === "Administrator"
                  ? "bg-[var(--primary-color)] text-[var(--background-color)] font-semibold"
                  : "bg-[var(--background-color)] text-[var(--primary-color)] border-2 border-[var(--primary-color)]"
              }`}
            >
              Administrator
            </button>
            <button
              onClick={() => setUserRole("Mycologist")}
              className={`px-4 py-2 rounded-lg font-[family-name:var(--font-bricolage-grotesque)] text-sm transition ${
                userRole === "Mycologist"
                  ? "bg-[var(--primary-color)] text-[var(--background-color)] font-semibold"
                  : "bg-[var(--background-color)] text-[var(--primary-color)] border-2 border-[var(--primary-color)]"
              }`}
            >
              Mycologist
            </button>
          </div>
          <p className="text-xs text-[var(--moldify-grey)] mt-2 font-[family-name:var(--font-bricolage-grotesque)]">
            Current role: <span className="font-semibold">{userRole}</span>
          </p>
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
