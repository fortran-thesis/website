"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faMinus,
  faExpand,
  faArrowLeft,
  faArrowRight,
  faRotateRight,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ImageViewerModalProps {
  isOpen: boolean;
  imagePaths: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export default function ImageViewerModal({
  isOpen,
  imagePaths,
  initialIndex = 0,
  onClose,
  title,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          setRotation((prev) => (prev + 90) % 360);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const currentImage = imagePaths[currentIndex];

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imagePaths.length);
    resetImageState();
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imagePaths.length) % imagePaths.length);
    resetImageState();
  };

  const resetImageState = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Limit pan boundaries
      const maxPan = (zoom - 1) * 100;
      setPan({
        x: Math.max(-maxPan, Math.min(newX, maxPan)),
        y: Math.max(-maxPan, Math.min(newY, maxPan)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mold-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && imageContainerRef.current) {
        await imageContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={imageContainerRef}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 focus:outline-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          // Close modal only if clicking the backdrop, not the modal content
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 bg-gradient-to-b from-black via-black/50 to-transparent z-50">
          <div className="flex-1">
            {title && (
              <h2 className="text-white font-black text-lg font-[family-name:var(--font-montserrat)] uppercase tracking-tight">
                {title}
              </h2>
            )}
            <p className="text-white/60 text-sm font-[family-name:var(--font-bricolage-grotesque)]">
              Image {currentIndex + 1} of {imagePaths.length}
            </p>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-white/40 text-xs text-right mr-4 font-[family-name:var(--font-bricolage-grotesque)]">
            <p>ESC to close</p>
            <p>←/→ to navigate</p>
            <p>+/- to zoom</p>
            <p>R to rotate</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center w-full cursor-grab active:cursor-grabbing overflow-hidden">
          <div
            ref={imgRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
          >
            <Image
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain select-none"
              quality={95}
              unoptimized
            />
          </div>
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            {/* Navigation */}
            {imagePaths.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevImage}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Previous image"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-white" />
                </button>
                <div className="flex gap-1">
                  {imagePaths.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        resetImageState();
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? "bg-[var(--accent-color)] w-6"
                          : "bg-white/40"
                      }`}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextImage}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Next image"
                >
                  <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-lg p-2 border border-white/20">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <FontAwesomeIcon icon={faMinus} className="w-4 h-4 text-white" />
              </button>
              <div className="text-white/80 text-sm min-w-[3rem] text-center font-[family-name:var(--font-bricolage-grotesque)]">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Rotate Button */}
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Rotate 90 degrees"
            >
              <FontAwesomeIcon icon={faRotateRight} className="w-4 h-4 text-white" />
              <span className="text-xs text-white/60 ml-1 inline-block font-[family-name:var(--font-bricolage-grotesque)]">{rotation}°</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Download image"
            >
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 text-white" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle fullscreen"
            >
              <FontAwesomeIcon icon={faExpand} className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-color)] transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / imagePaths.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
