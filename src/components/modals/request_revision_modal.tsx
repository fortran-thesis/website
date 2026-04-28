"use client";
import { useState } from "react";
import Image from "next/image";
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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
  useBodyScrollLock(isOpen);

  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    onSubmit(details);
    setDetails(""); // clear input after submit
  };

  return (
    <>
      {/* Top Loading Bar */}
      {isSubmitting && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur px-4 overflow-hidden">
  <div className="bg-[var(--background-color)] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-xl p-10 relative border border-[var(--primary-color)]/5">
    
    {/* --- HEADER (Kept as per your screenshot) --- */}
    <div className="flex justify-center items-center mb-8">
      <div className="flex items-center space-x-2">
        <Image
          src={MoldifyLogo}
          alt="Moldify Logo"
          width={25}
          height={25}
          className="object-contain"
        />
        <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs tracking-[0.2em]">
          MOLDIFY
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-[var(--moldify-red)] text-xl leading-none hover:rotate-90 transition-all duration-300 cursor-pointer font-black"
      >
        ✕
      </button>
    </div>

    <div className="text-center mb-8">
      <h2 className="text-3xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] tracking-tighter mb-2">
        REQUEST REVISION
      </h2>
      <p className="text-[var(--moldify-black)] opacity-60 text-sm font-[family-name:var(--font-bricolage-grotesque)] max-w-[80%] mx-auto">
        A content revision has been requested due to issues found in the reported entry.
      </p>
    </div>
    {/* --- END HEADER --- */}

    {/* Reason Section: Refined as an "Information Tile" */}
    <div className="flex items-start gap-4 mb-8 p-5 rounded-2xl bg-[var(--primary-color)]/[0.03] border border-[var(--primary-color)]/5">
      <div className="mt-1 w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)] flex-shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-[var(--primary-color)] font-black text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-wide">
          {reasonTitle}
        </p>
        <p className="text-[var(--moldify-black)] text-sm opacity-70 font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed">
          {reasonDescription}
        </p>
      </div>
    </div>

    {/* Text Area Form */}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="details"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-50 font-[family-name:var(--font-bricolage-grotesque)] ml-1"
        >
          Additional Details
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please specify the corrections needed..."
          className="w-full bg-[var(--moldify-black)]/[0.02] border border-[var(--primary-color)]/10 text-sm text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] rounded-2xl p-5 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all placeholder:opacity-30"
          required
        ></textarea>
      </div>

      {/* Buttons: High-Impact Styling */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 cursor-pointer border-2 border-[var(--primary-color)]/10 text-[var(--primary-color)] font-black px-6 py-4 rounded-2xl hover:bg-[var(--primary-color)]/5 transition-all font-[family-name:var(--font-bricolage-grotesque)] text-xs uppercase tracking-[0.2em]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-[1.5] bg-[var(--primary-color)] text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-[var(--primary-color)]/20 hover:scale-[1.02] active:scale-95 transition-all font-[family-name:var(--font-bricolage-grotesque)] text-xs uppercase tracking-[0.2em] ${
            isSubmitting ? 'opacity-60 cursor-wait' : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Submit Revision'}
        </button>
      </div>
    </form>
  </div>
</div>
    </>
  );
}
