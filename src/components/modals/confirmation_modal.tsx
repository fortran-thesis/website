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
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  title,
  subtitle,
  cancelText = "Cancel",
  confirmText = "Yes",
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
      <div className="bg-[var(--background-color)] rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
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
                className="absolute top-5 right-3 text-[var(--moldify-red)] hover:text-red-600 cursor-pointer font-black"
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
            className="px-7 py-2 rounded-full bg-transparent text-[var(--moldify-black)] hover:bg-[var(--moldify-red)]/10 hover:text-[var(--moldify-red)] font-[family-name:var(--font-bricolage-grotesque)] font-semibold cursor-pointer transition-colors duration-200 ease-in-out"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-12 rounded-lg bg-[var(--primary-color)] text-[var(--background-color)] font-semibold font-[family-name:var(--font-bricolage-grotesque)] hover:bg-[var(--hover-primary)] cursor-pointer transition-colors duration-200 ease-in-out"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
