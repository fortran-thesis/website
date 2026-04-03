"use client";

import { ReactNode } from "react";

interface MessageBannerProps {
  variant: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<MessageBannerProps["variant"], string> = {
  error: "border-[var(--moldify-red)]/15 bg-[var(--moldify-red)]/[0.06] text-[var(--moldify-red)]",
  success: "border-[var(--accent-color)]/15 bg-[var(--accent-color)]/[0.08] text-[var(--primary-color)]",
  info: "border-[var(--primary-color)]/10 bg-[var(--primary-color)]/[0.04] text-[var(--primary-color)]",
};

export default function MessageBanner({ variant, children, className = "" }: MessageBannerProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold shadow-sm ${VARIANT_STYLES[variant]} ${className}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
