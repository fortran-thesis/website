"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangePasswordFormProps {
  onSave: (data: PasswordData) => void;
  onError?: (message: string | null) => void;
  isLoading?: boolean;
}

export default function ChangePasswordForm({
  onSave,
  onError,
  isLoading = false,
}: ChangePasswordFormProps) {
  const [formData, setFormData] = useState<PasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // separate visibility states
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onError?.(null);
  };

  const hasLowerCase = /[a-z]/.test(formData.newPassword);
  const hasUpperCase = /[A-Z]/.test(formData.newPassword);
  const hasNumber = /[0-9]/.test(formData.newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(formData.newPassword);
  const hasMinLength = formData.newPassword.length >= 8;
  const passwordsMatch =
    formData.confirmNewPassword.length > 0 &&
    formData.newPassword === formData.confirmNewPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      onError?.("New passwords do not match.");
      return;
    }

    // Validate password complexity (must match server PasswordSchema)
    if (formData.newPassword.length < 8) {
      onError?.("Password must be at least 8 characters long.");
      return;
    }
    if (!/[a-z]/.test(formData.newPassword)) {
      onError?.("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[A-Z]/.test(formData.newPassword)) {
      onError?.("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(formData.newPassword)) {
      onError?.("Password must contain at least one number.");
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(formData.newPassword)) {
      onError?.("Password must contain at least one special character.");
      return;
    }

    onError?.(null);

    onSave(formData);
  };

  const togglePasswordVisibility = (field: keyof PasswordData) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const labelStyles = "font-[family-name:var(--font-bricolage-grotesque)] text-[11px] uppercase tracking-[0.15em] text-[var(--primary-color)] font-black mb-2 block opacity-60";
  const inputStyles = "w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3.5 px-5 rounded-xl border border-transparent focus:border-[var(--primary-color)]/20 focus:bg-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className={`space-y-12 mt-5 ${isLoading ? "cursor-wait" : ""}`}>
      {/* Header */}
      <header className="mt-10 mb-12 flex flex-col gap-2">
        <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight leading-none">
          My Password
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          Account Security Protocol
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-10">
        {[
          {
            label: "Current Password",
            field: "oldPassword",
            placeholder: "••••••••",
          },
          {
            label: "New Password",
            field: "newPassword",
            placeholder: "••••••••",
          },
          {
            label: "Confirm New Password",
            field: "confirmNewPassword",
            placeholder: "••••••••",
          },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className={field === "oldPassword" ? "md:col-span-2" : ""}>
            <label htmlFor={field} className={labelStyles}>{label}</label>
            <div className="relative">
              <input
                id={field}
                name={field}
                type={showPassword[field as keyof PasswordData] ? "text" : "password"}
                placeholder={placeholder}
                value={formData[field as keyof PasswordData]}
                onChange={(e) => handleInputChange(field as keyof PasswordData, e.target.value)}
                disabled={isLoading}
                required
                className={`${inputStyles} pr-14`}
              />

              <button
                type="button"
                onClick={() => togglePasswordVisibility(field as keyof PasswordData)}
                className="cursor-pointer absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-20 hover:opacity-100 transition-all p-1 disabled:cursor-not-allowed"
                tabIndex={-1}
                aria-label={showPassword[field as keyof PasswordData] ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={showPassword[field as keyof PasswordData] ? faEye : faEyeSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Tray */}
      {formData.newPassword && (
        <div className="p-8 bg-[var(--taupe)] rounded-[2rem] border border-[var(--primary-color)]/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
          {[
            { met: hasMinLength, label: "08+ Character Units" },
            { met: hasLowerCase, label: "Lowercase Sequence" },
            { met: hasUpperCase, label: "Uppercase Sequence" },
            { met: hasNumber, label: "Numerical Entry" },
            { met: hasSpecialChar, label: "Symbolic Integrity" },
            { met: passwordsMatch, label: "Passwords Match" },
          ].map((req, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${req.met ? "opacity-100" : "opacity-20"}`}>
              <FontAwesomeIcon
                icon={req.met ? faCircleCheck : faCircle}
                className={`w-3.5 h-3.5 transition-colors duration-500 ${req.met ? "text-[var(--accent-color)] shadow-[0_0_15px_var(--accent-color)]/20" : "text-[var(--primary-color)]"}`}
              />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer px-12 py-4 rounded-xl bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
