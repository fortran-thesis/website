"use client";

import { FC } from "react";
import Image from 'next/image';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className={`bg-[var(--background-color)] rounded-2xl p-6 w-full max-w-lg shadow-lg relative my-auto ${confirmDisabled ? "cursor-wait" : ""}`}>
        {/* Close button */}
        <div className ="flex justify-center items-center mb-4">
            <div className = "flex justify-between items-center space-x-3">
                <Image
                src={MoldifyLogov2}
                alt="Moldify Logo"
                width={25}
                height={25}
                className="object-contain rounded-xl"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs">MOLDIFY</p>
            </div>
            <button
                type="button"
                onClick={onCancel}
                disabled={confirmDisabled}
                className={`absolute top-5 right-3 text-[var(--moldify-red)] text-xl leading-none transition font-black ${
                  confirmDisabled ? "cursor-not-allowed opacity-60" : "hover:scale-110 cursor-pointer"
                }`}
                >
                ✕
            </button>
        </div>

        {/* Header */}
        <h2 className="text-[var(--primary-color)] font-black font-[family-name:var(--font-montserrat)] text-xl mb-1">{title}</h2>
        <p className="text-[var(--moldify-black)] text-sm font-[family-name:var(--font-bricolage-grotesque)] mb-6">{subtitle}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={confirmDisabled}
            className={`px-7 py-2 rounded-full bg-transparent text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] font-semibold transition-colors duration-200 ease-in-out ${
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
            className="px-12 rounded-lg bg-[var(--primary-color)] text-[var(--background-color)] font-semibold font-[family-name:var(--font-bricolage-grotesque)] hover:bg-[var(--hover-primary)] cursor-pointer transition-colors duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {confirmDisabled && confirmLoadingText ? confirmLoadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
