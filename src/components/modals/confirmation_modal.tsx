"use client";

import { FC } from "react";
import Image from 'next/image';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

{/* IMAGES */}
const MoldifyLogov2 = '/assets/moldify-logo-v3.svg';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  confirmLoadingText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  title,
  subtitle,
  cancelText = "Cancel",
  confirmText = "Yes",
  confirmDisabled = false,
  confirmLoadingText,
  onCancel,
  onConfirm,
}) => {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className={`bg-[var(--background-color)] rounded-3xl p-8 w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-[var(--primary-color)]/10 relative my-auto ${confirmDisabled ? "cursor-wait" : ""}`}>
        
        {/* 1. BRAND HEADER: Restored to your original centered consistency */}
        <div className="flex justify-center items-center mb-6">
            <div className="flex justify-between items-center space-x-3">
                <Image
                    src={MoldifyLogov2}
                    alt="Moldify Logo"
                    width={25}
                    height={25}
                    className="object-contain rounded-xl"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs tracking-[0.3em]">MOLDIFY</p>
            </div>
            <button
                type="button"
                onClick={onCancel}
                disabled={confirmDisabled}
                className={`absolute top-6 right-6 text-[var(--moldify-red)] text-xl leading-none transition font-black ${
                    confirmDisabled ? "cursor-not-allowed opacity-60" : "hover:scale-110 cursor-pointer"
                }`}
            >
                ✕
            </button>
        </div>

        {/* 2. CONTENT: Improved typography while maintaining structure */}
        <div className="mb-8">
            <h2 className="text-[var(--primary-color)] font-black font-[family-name:var(--font-montserrat)] text-2xl tracking-tighter mb-2">
                {title}
            </h2>
            <p className="text-[var(--moldify-black)] text-sm font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed">
                {subtitle}
            </p>
        </div>

        {/* 3. BUTTONS: Refined for "Impact" within the original layout */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={confirmDisabled}
            className={`px-7 py-2 rounded-full bg-transparent text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] font-black text-xs uppercase tracking-widest transition-all ${
              confirmDisabled
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-[var(--moldify-red)]/10 hover:text-[var(--moldify-red)] cursor-pointer"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="px-10 py-3 rounded-2xl bg-[var(--primary-color)] text-[var(--background-color)] font-black font-[family-name:var(--font-bricolage-grotesque)] text-xs uppercase tracking-widest hover:bg-[var(--hover-primary)] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {confirmDisabled && confirmLoadingText ? confirmLoadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
