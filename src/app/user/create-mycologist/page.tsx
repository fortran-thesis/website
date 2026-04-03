"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCircleCheck, faEye, faEyeSlash, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import ConfirmModal from "@/components/modals/confirmation_modal";
import MessageBanner from "@/components/feedback/message_banner";
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
  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

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



  const labelStyles = "font-[family-name:var(--font-bricolage-grotesque)] text-[11px] uppercase tracking-[0.15em] text-[var(--primary-color)] font-black mb-2 block opacity-60";
  const inputStyles = "w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3.5 px-5 rounded-xl border border-transparent focus:border-[var(--primary-color)]/20 focus:bg-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="mx-auto w-full py-12 px-6">
      <Breadcrumbs role={userRole} />

      <header className="mt-10 mb-12 flex items-center gap-6">
        <BackButton onClick={handleBackClick} />
        <div className="flex flex-col">
          <h2 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight leading-none">
            Register Mycologist
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] mt-2 font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
            Account Provisioning Portal
          </p>
        </div>
      </header>

      {error && (
        <MessageBanner variant="error" className="mb-10 text-[10px] uppercase tracking-widest">
          {error}
        </MessageBanner>
      )}

      <form onSubmit={handleCreateClick} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Identity Section */}
          <div>
            <label htmlFor="first-name" className={labelStyles}>First Name</label>
            <input id="first-name" placeholder="Enter first name" type="text" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} disabled={isLoading} required className={inputStyles} />
          </div>

          <div>
            <label htmlFor="last-name" className={labelStyles}>Last Name</label>
            <input id="last-name" placeholder="Enter last name" type="text" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} disabled={isLoading} required className={inputStyles} />
          </div>

          <div>
            <label htmlFor="username" className={labelStyles}>Username</label>
            <input id="username" placeholder="Enter username" type="text" value={formData.username} onChange={(e) => handleChange("username", e.target.value)} disabled={isLoading} required className={inputStyles} />
          </div>

          <div>
            <label htmlFor="email" className={labelStyles}>Registry Email</label>
            <input id="email" placeholder="email@moldify.com" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} disabled={isLoading} required className={inputStyles} />
          </div>

          {/* Security Section */}
          <div>
            <label htmlFor="password" className={labelStyles}>Password</label>
            <div className="relative">
              <input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} disabled={isLoading} required className={inputStyles} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading} className="cursor-pointer absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-20 hover:opacity-100 transition-all p-1">
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className={labelStyles}>Confirm Password</label>
            <div className="relative">
              <input id="confirm-password" placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} disabled={isLoading} required className={inputStyles} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading} className="cursor-pointer absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-20 hover:opacity-100 transition-all p-1">
                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Validation Tray - Matching your specific palette */}
        {formData.password && (
          <div className="p-8 bg-[var(--taupe)] rounded-[2rem] border border-[var(--primary-color)]/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
            {[
              { met: hasMinLength, label: "08+ Character Units" },
              { met: hasLowerCase, label: "Lowercase Sequence" },
              { met: hasUpperCase, label: "Uppercase Sequence" },
              { met: hasNumber, label: "Numerical Entry" },
              { met: hasSpecialChar, label: "Symbolic Integrity" },
              { met: passwordsMatch, label: "Passwords Match" },
            ].map((req, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${req.met ? 'opacity-100' : 'opacity-20'}`}>
                <FontAwesomeIcon 
                  icon={req.met ? faCircleCheck : faCircle} 
                  className={`w-3.5 h-3.5 transition-colors duration-500 ${req.met ? 'text-[var(--accent-color)] shadow-[0_0_15px_var(--accent-color)]/20' : 'text-[var(--primary-color)]'}`} 
                />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <footer className="flex justify-end items-center gap-6 pt-10 border-t border-[var(--primary-color)]/5">
          <button type="button" onClick={handleBackClick} disabled={isLoading} className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] opacity-40 hover:opacity-100 transition-all disabled:opacity-20 font-[family-name:var(--font-bricolage-grotesque)]">
            Cancel Registration
          </button>
          <button type="submit" disabled={isLoading} className="cursor-pointer px-12 py-4 rounded-xl bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUserPlus} className="text-[10px]" />
              <span>{isLoading ? "Creating..." : "Create Account"}</span>
            </div>
          </button>
        </footer>
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
