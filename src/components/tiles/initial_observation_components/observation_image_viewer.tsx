"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCircleNotch } from "@fortawesome/free-solid-svg-icons";

/**
 * ObservationImageViewer
 * * A flexible image rendering component supporting multiple image sources
 * with intelligent fallback handling.
 * * Supports three image source types:
 * 1. Asset paths - starts with "assets/"
 * 2. Remote URLs - starts with "http://" or "https://"
 * 3. Local file paths - any other non-empty path
 * * Displays loading states for remote images and provides fallback UI
 * when images fail to load.
 * * @component
 * @interface
 * @property {string} imagePath - Image source path (asset, URL, or local file path)
 * @property {string} [objectFit] - CSS object-fit value (default: "cover")
 * @property {boolean} [showLoader] - Whether to show loading indicator for remote images (default: true)
 */
interface ObservationImageViewerProps {
  imagePath: string;
  objectFit?: "cover" | "contain" | "fill" | "scale-down";
  showLoader?: boolean;
}

/**
 * ImageFallback
 * Internal component displayed when image fails to load
 * Uses Bricolage Grotesque for an editorial, designed feel
 */
function ImageFallback({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="w-full h-full bg-[var(--primary-color)]/[0.03] flex flex-col items-center justify-center gap-4 transition-all duration-700">
      {isLoading ? (
        <div className="relative flex items-center justify-center">
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="w-8 h-8 text-[var(--primary-color)]/20 animate-spin"
          />
          <div className="absolute inset-0 blur-sm scale-110 opacity-50 bg-[var(--primary-color)]/10 rounded-full" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/[0.05] flex items-center justify-center">
            <FontAwesomeIcon
              icon={faImage}
              className="w-5 h-5 text-[var(--primary-color)]/20"
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)]/30 font-[family-name:var(--font-bricolage-grotesque)]">
            Missing Asset
          </p>
        </div>
      )}
    </div>
  );
}

export default function ObservationImageViewer({
  imagePath,
  objectFit = "cover",
  showLoader = true,
}: ObservationImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Normalize image path: trim whitespace
   */
  const normalized = (imagePath ?? "").trim();

  /**
   * Handle image load completion
   */
  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  /**
   * Handle image load error
   */
  const handleLoadError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Map objectFit to Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    "scale-down": "object-scale-down",
  }[objectFit] || "object-cover";

  // Show fallback if path is empty or image failed to load
  if (!normalized || hasError) {
    return (
      <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-[var(--primary-color)]/5">
        <ImageFallback isLoading={false} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group overflow-hidden bg-[var(--primary-color)]/[0.02] rounded-[2.5rem] border border-[var(--primary-color)]/5 transition-all duration-700 hover:border-[var(--primary-color)]/20">
      {/* Editorial Vignette Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-transparent opacity-60 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
      
      <Image
        src={normalized}
        alt="Observation image"
        fill
        className={`${objectFitClass} transition-all duration-1000 ease-out group-hover:scale-105 group-hover:rotate-1`}
        onLoadingComplete={handleLoadComplete}
        onError={handleLoadError}
      />

      {/* Modern High-End Loader Overlay */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-2xl transition-all duration-500">
          <ImageFallback isLoading={true} />
        </div>
      )}

      {/* Decorative Label (Editorial Touch) */}
      <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
          <p className="text-[8px] font-black text-[var(--primary-color)] uppercase tracking-widest font-[family-name:var(--font-bricolage-grotesque)]">
            Full Resolution
          </p>
        </div>
      </div>
    </div>
  );
}