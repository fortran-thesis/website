"use client";
import { useState } from "react";
import Image from "next/image";

const MoldifyLogo = "/assets/moldify-logo-v3.svg";

interface RequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: string) => void;
  reasonTitle: string; 
  reasonDescription: string; 
  isSubmitting?: boolean; 
}

export default function RequestRevisionModal({
  isOpen,
  onClose,
  onSubmit,
  reasonTitle,
  reasonDescription,
  isSubmitting = false,
}: RequestRevisionModalProps) {
  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    onSubmit(details);
    setDetails(""); // clear input after submit
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--background-color)] rounded-2xl shadow-xl w-full max-w-xl p-8 relative">
        {/* Header */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center space-x-2">
            <Image
              src={MoldifyLogo}
              alt="Moldify Logo"
              width={25}
              height={25}
              className="object-contain"
            />
            <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs">
              MOLDIFY
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[var(--moldify-red)] hover:text-red-600 font-black text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
          REQUEST REVISION
        </h2>
        <p className="text-[var(--moldify-black)] text-sm mb-4 font-[family-name:var(--font-bricolage-grotesque)]">
          A content revision has been requested due to issues found in the reported entry.
        </p>

        {/* Reason Section */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="mt-2 w-5 h-3 bg-[var(--accent-color)] rounded-full"></div>
          <div>
            <p className="text-[var(--primary-color)] font-black text-base font-[family-name:var(--font-montserrat)]">
              {reasonTitle}
            </p>
            <p className="text-[var(--moldify-black)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">
              {reasonDescription}
            </p>
          </div>
        </div>

        {/* Text Area */}
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="details"
            className="text-sm font-semibold text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] mb-2 block"
          >
            Please provide additional details.
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter additional information here..."
            className="w-full bg-[var(--taupe)] text-sm text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] rounded-lg p-3 h-28 resize-none focus:outline-none"
            required
          ></textarea>

          {/* Buttons */}
          <div className="flex justify-between mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold px-6 py-2 w-full rounded-lg hover:bg-[var(--primary-color)] hover:text-[var(--background-color)] transition font-[family-name:var(--font-bricolage-grotesque)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-6 py-2 w-full rounded-lg hover:bg-[var(--hover-primary)] transition font-[family-name:var(--font-bricolage-grotesque)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
