"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { apiMutate, ApiError } from '@/lib/api';
import { useInvalidationFunctions } from '@/utils/cache-invalidation';

export interface MycoFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CreateMycologist() {
  const router = useRouter();
  const userRole = "Administrator";
  const { invalidateUsers } = useInvalidationFunctions();

  const [formData, setFormData] = useState<MycoFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check if form has changes
  const hasChanges = () => {
    return Object.values(formData).some(value => value !== "");
  };

  // Password requirement checkers
  const hasLowerCase = [...formData.password].some(char => /[a-z]/.test(char));
  const hasUpperCase = [...formData.password].some(char => /[A-Z]/.test(char));
  const hasNumber = [...formData.password].some(char => /[0-9]/.test(char));
  const hasSpecialChar = [...formData.password].some(char => /[^a-zA-Z0-9]/.test(char));
  const hasMinLength = formData.password.length >= 8;

  const handleChange = (field: keyof MycoFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  // Handle back/cancel with confirmation if there are changes
  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackModal(true);
    } else {
      router.back();
    }
  };

  // Confirm back navigation
  const confirmBack = () => {
    setShowBackModal(false);
    router.back();
  };

  // Handle create account submission with confirmation
  const handleCreateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (formData.password.length < 8 || !hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      setError("Password doesn't follow requirements");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Show confirmation modal
    setShowCreateModal(true);
  };

  // Confirm account creation
  const confirmCreate = async () => {
    setShowCreateModal(false);
    setIsLoading(true);

    try {
      await apiMutate('/api/v1/mycologists', {
        method: 'POST',
        body: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      });

      await invalidateUsers();

      // Success - redirect back to user management page
      router.push('/user');
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.info?.error ?? err.info?.message ?? err.message
          : err?.message ?? 'An error occurred while creating the account';

      if (message.toLowerCase().includes('email') && message.toLowerCase().includes('already')) {
        setError('Email already exists');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col">
        <Breadcrumbs role={userRole} />
        <div className="flex items-center gap-4 mb-2">
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl uppercase">
            User Management
          </h1>
        </div>
      </div>

      <div className = "mt-10">
        {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs">
          {error}
        </div>
      )}

    
      <div className = "mb-5">
        <div className="flex items-start gap-4">
          <BackButton onClick={handleBackClick} />
          <div className="flex flex-col">
            <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
              Create Mycologist Account
            </h2>
            <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
              Register a new mycologist to the system.
            </p>
          </div>
        </div>
      </div>

      </div>
      {/* Form */}
      <form onSubmit={handleCreateClick} className="space-y-6 mt-4">
        <div className="border border-[var(--moldify-softGrey)] rounded-lg p-8 bg-transparent">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="first-name"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                First Name
              </label>
              <input
                id="first-name"
                placeholder="Enter First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={isLoading}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="last-name"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                Last Name
              </label>
              <input
                id="last-name"
                placeholder="Enter Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={isLoading}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                Username
              </label>
              <input
                id="username"
                placeholder="Enter Username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={isLoading}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                Email
              </label>
              <input
                id="email"
                placeholder="Enter Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isLoading}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                Password
              </label>
              <div className="relative mb-3">
                <input
                  id="password"
                  placeholder="Enter Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-12 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-50 cursor-pointer hover:opacity-100 transition-all disabled:cursor-not-allowed"
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-4 h-4" />
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-2 text-xs font-[family-name:var(--font-bricolage-grotesque)] mb-3">
                  <div className={hasMinLength ? "text-green-600" : "text-red-600"}>
                    ✓ At least 8 characters
                  </div>
                  <div className={hasLowerCase ? "text-green-600" : "text-red-600"}>
                    ✓ At least one lowercase letter (a-z)
                  </div>
                  <div className={hasUpperCase ? "text-green-600" : "text-red-600"}>
                    ✓ At least one capital letter (A-Z)
                  </div>
                  <div className={hasNumber ? "text-green-600" : "text-red-600"}>
                    ✓ At least one number (0-9)
                  </div>
                  <div className={hasSpecialChar ? "text-green-600" : "text-red-600"}>
                    ✓ At least one special character (!@#$%^&*...)
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-2 block"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-12 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-50 cursor-pointer hover:opacity-100 transition-all disabled:cursor-not-allowed"
                  aria-label="Toggle confirm password visibility"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleBackClick}
            disabled={isLoading}
            className={`px-10 py-3 rounded-lg bg-transparent border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] font-semibold hover:bg-[var(--primary-color)]/10 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-10 py-3 rounded-lg bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] font-semibold hover:bg-[var(--hover-primary)] transition-colors ${
              isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'
            }`}
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>

      {/* Back/Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showBackModal}
        onConfirm={confirmBack}
        onCancel={() => setShowBackModal(false)}
        title="Discard Changes?"
        subtitle="You have unsaved changes. Are you sure you want to go back and discard them?"
        confirmText="Yes, Discard"
        cancelText="No, Keep Editing"
      />

      {/* Create Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showCreateModal}
        onConfirm={confirmCreate}
        onCancel={() => setShowCreateModal(false)}
        title="Create Mycologist Account?"
        subtitle={`Are you sure you want to create a new mycologist account for ${formData.firstName} ${formData.lastName}?`}
        confirmText="Yes, Create Account"
        cancelText="No, Cancel"
      />
    </main>
  );
}
