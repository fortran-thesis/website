"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Image from "next/image";

const MoldifyLogov2 = "/assets/moldify-logo-v3.svg";

interface AddMycoModalProps {
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

export default function AddMycoModal({ isOpen, onClose, onSubmit }: AddMycoModalProps) {
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

  if (!isOpen) return null;

  const handleChange = (field: keyof MycoFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form after submission
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--background-color)] rounded-2xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
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
          CREATE MYCOLOGIST ACCOUNT
        </h2>
        <p className="text-[var(--moldify-black)] text-sm mb-4 font-[family-name:var(--font-bricolage-grotesque)]">
          Register new mycologists to the system.
        </p>

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
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-10 rounded-lg focus:outline-none appearance-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-[var(--hover-primary)] transition cursor-pointer"
                aria-label="Toggle password visibility"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2 block"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                required
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-10 rounded-lg focus:outline-none appearance-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-[var(--hover-primary)] transition cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-lg hover:bg-[var(--hover-primary)] transition mt-5"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}