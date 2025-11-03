"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Image from "next/image";

const MoldifyLogov2 = "/assets/moldify-logo-v3.svg";

interface EditMycoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MycoFormData) => void;
}

export interface MycoFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function EditMycoModal({ isOpen, onClose, onSubmit }: EditMycoModalProps) {
  const [formData, setFormData] = useState<MycoFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof MycoFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

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
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/mycologists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result?.error || result?.message || "Failed to create account");
        return;
      }

      setSuccessMessage("Mycologist account created successfully!");
      
      // Call parent's onSubmit callback for additional handling (e.g., refresh user list)
      onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An error occurred while creating the account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--background-color)] rounded-2xl shadow-xl w-full max-w-lg p-8 relative max-h-[100vh] overflow-hidden">
         <div className="overflow-y-auto max-h-[90vh]">
            <div className="pr-2">
                {/* Header */}
            <div className="flex justify-center items-center mb-4">
            <div className="flex justify-between items-center space-x-3">
                <Image
                src={MoldifyLogov2}
                alt="Moldify Logo"
                width={25}
                height={25}
                className="object-contain rounded-xl"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs">
                MOLDIFY
                </p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-3 text-[var(--moldify-red)] hover:text-red-600 cursor-pointer font-black"
            >
                ✕
            </button>
            </div>

            <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
              EDIT MYCOLOGIST ACCOUNT
            </h2>
            <p className="text-[var(--moldify-black)] text-sm mb-4 font-[family-name:var(--font-bricolage-grotesque)]">
              Edit existing mycologist information.
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-[var(--moldify-red)]/10 border-l-4 border-[var(--moldify-red)] p-3 mb-4 rounded">
                <p className="text-[var(--moldify-red)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 p-3 mb-4 rounded">
                <p className="text-green-700 text-sm font-[family-name:var(--font-bricolage-grotesque)]">
                  {successMessage}
                </p>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
                <label
                htmlFor="first-name"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
                >
                First Name
                </label>
                <input
                id="first-name"
                placeholder="Enter First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
                />
            </div>

            {/* Last Name */}
            <div>
                <label
                htmlFor="last-name"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
                >
                Last Name
                </label>
                <input
                id="last-name"
                placeholder="Enter Last Name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
                />
            </div>

            {/* Username */}
            <div>
                <label
                htmlFor="username"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
                >
                Username
                </label>
                <input
                id="username"
                placeholder="Enter Username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
                />
            </div>

            {/* Email */}
            <div>
                <label
                htmlFor="email"
                className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
                >
                Email
                </label>
                <input
                id="email"
                placeholder="Enter Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-lg hover:bg-[var(--hover-primary)] transition mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
              > 
                {isLoading ? "Saving..." : "Save Changes"}
            </button>
            </form>
            </div>
         </div>
     </div>
    </div>
  );
}