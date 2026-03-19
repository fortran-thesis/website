"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

/**
 * ObservationImageViewer
 * 
 * A flexible image rendering component supporting multiple image sources
 * with intelligent fallback handling.
 * 
 * Supports three image source types:
 * 1. Asset paths - starts with "assets/"
 * 2. Remote URLs - starts with "http://" or "https://"
 * 3. Local file paths - any other non-empty path
 * 
 * Displays loading states for remote images and provides fallback UI
 * when images fail to load.
 * 
 * @component
 * @interface
 * @property {string} imagePath - Image source path (asset, URL, or local file path)
 * @property {string} [objectFit] - CSS object-fit value (default: "cover")
 * @property {boolean} [showLoader] - Whether to show loading indicator for remote images (default: true)
 * 
 * @example
 * ```tsx
 * <ObservationImageViewer
 *   imagePath="/api/images/observation-001.jpg"
 *   objectFit="contain"
 * />
 * ```
 */
interface ObservationImageViewerProps {
  imagePath: string;
  objectFit?: "cover" | "contain" | "fill" | "scale-down";
  showLoader?: boolean;
}

/**
 * ImageFallback
 * Internal component displayed when image fails to load
 */
function ImageFallback({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="w-full h-full bg-[var(--primary-color)]/[0.08] flex items-center justify-center">
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-[var(--primary-color)]/30 border-t-[var(--primary-color)] rounded-full animate-spin" />
      ) : (
        <FontAwesomeIcon
          icon={faImage}
          className="w-7 h-7 text-[var(--primary-color)]"
        />
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
   * Detect image source type
   */
  const isAsset = normalized.startsWith("assets/");
  const isRemote =
    normalized.startsWith("http://") || normalized.startsWith("https://");

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

  // Show fallback if path is empty or image failed to load
  if (!normalized || hasError) {
    return <ImageFallback isLoading={false} />;
  }

  return (
    <>
      {isRemote ? (
        // Remote image with loading state
        <Image
          src={normalized}
          alt="Observation image"
          fill
          className={`object-${objectFit}`}
          onLoadingComplete={handleLoadComplete}
          onError={handleLoadError}
        />
      ) : (
        // Asset or local image
        <Image
          src={normalized}
          alt="Observation image"
          fill
          className={`object-${objectFit}`}
          onLoadingComplete={handleLoadComplete}
          onError={handleLoadError}
        />
      )}

      {/* Loading overlay */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <ImageFallback isLoading={true} />
        </div>
      )}
    </>
  );
}
