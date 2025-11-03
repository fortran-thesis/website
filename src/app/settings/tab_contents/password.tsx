"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangePasswordFormProps {
  onSave: (data: PasswordData) => void;
  isLoading?: boolean;
}

export default function ChangePasswordForm({
  onSave,
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    onSave(formData);
  };

  const togglePasswordVisibility = (field: keyof PasswordData) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-8 mt-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
          Password
        </h2>
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Update your account password.
        </p>
      </div>

      {/* Form Container */}
      <div className="border border-[var(--moldify-softGrey)] rounded-lg p-8 bg-transparent">
        {[
          {
            label: "Old Password",
            field: "oldPassword",
            placeholder: "Enter old password",
          },
          {
            label: "New Password",
            field: "newPassword",
            placeholder: "Enter new password",
          },
          {
            label: "Confirm New Password",
            field: "confirmNewPassword",
            placeholder: "Confirm new password",
          },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="mb-6">
            <label
              htmlFor={field}
              className="block font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mb-1"
            >
              {label}
            </label>

            <div className="relative flex items-center">
              <input
                id={field}
                name={field}
                type={showPassword[field as keyof PasswordData] ? "text" : "password"}
                placeholder={placeholder}
                value={formData[field as keyof PasswordData]}
                onChange={(e) =>
                  handleInputChange(field as keyof PasswordData, e.target.value)
                }
                disabled={isLoading}
                required
                className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none w-full pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={() => togglePasswordVisibility(field as keyof PasswordData)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--primary-color)] p-2 rounded-full hover:bg-black/10 transition cursor-pointer"
                tabIndex={-1}
                aria-label={
                  showPassword[field as keyof PasswordData]
                    ? "Hide password"
                    : "Show password"
                }
              >
                <FontAwesomeIcon
                  icon={
                    showPassword[field as keyof PasswordData] ? faEye : faEyeSlash
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[var(--primary-color)] hover:bg-[var(--hover-primary)] text-[var(--background-color)] px-10 py-3 rounded-lg font-semibold transition w-full md:w-auto cursor-pointer disabled:opacity-60"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
