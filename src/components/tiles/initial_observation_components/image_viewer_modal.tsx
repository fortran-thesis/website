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
  const ZOOM_STEP = 0.2;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [clickZoomDirection, setClickZoomDirection] = useState<"in" | "out">("in");
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
      setZoom(MIN_ZOOM);
      setClickZoomDirection("in");
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
    setZoom((prev) => {
      const next = Math.min(prev + ZOOM_STEP, MAX_ZOOM);
      if (next >= MAX_ZOOM) setClickZoomDirection("out");
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      if (next <= MIN_ZOOM) setClickZoomDirection("in");
      return next;
    });
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
    setZoom(MIN_ZOOM);
    setClickZoomDirection("in");
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

  const handleDownload = () => {
    const raw = (currentImage ?? "").trim();
    if (!raw) return;

    let resolved = raw;
    try {
      resolved = new URL(raw, window.location.origin).toString();
    } catch {
      // Keep original path if URL normalization fails.
    }

    let filename = `mold-image-${currentIndex + 1}.jpg`;
    try {
      const parsed = new URL(resolved, window.location.origin);
      const last = parsed.pathname.split("/").filter(Boolean).pop();
      if (last && last.includes(".")) {
        filename = decodeURIComponent(last);
      }
    } catch {
      // Keep fallback filename.
    }

    const link = document.createElement("a");
    link.href = resolved;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  {/* Backdrop: Soft Sage-Charcoal for better eye comfort */}
  <div
    className="fixed inset-0 bg-[#2D3027]/95 backdrop-blur-xl z-[9998]"
    onClick={onClose}
  />

  {/* Modal Container */}
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center focus:outline-none overflow-hidden"
    onKeyDown={(e) => {
      if (e.key === 'Escape') onClose();
    }}
  >
    {/* Header with Guidelines */}
    <div className="absolute top-0 left-0 right-0 min-h-24 flex items-start justify-between px-3 sm:px-6 md:px-10 pt-3 sm:pt-4 z-[10000] bg-gradient-to-b from-[#1D1F1A]/80 via-[#1D1F1A]/35 to-transparent">
      <div className="flex flex-col max-w-[calc(100%-5rem)] sm:max-w-[calc(100%-6rem)]">
        {title && (
          <h2 className="text-white font-[family-name:var(--font-montserrat)] text-[11px] sm:text-xs font-black uppercase tracking-[0.2em]">
            {title}
          </h2>
        )}
        <div className="flex flex-col items-start gap-1.5 mt-2">
          {/* Visual Guideline Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">ESC</span>
              <span className="text-white/20 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest">Close</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Arrows</span>
              <span className="text-white/20 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest">Nav</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">+ / -</span>
              <span className="text-white/20 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest">Zoom</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">R</span>
              <span className="text-white/20 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest">Rotate</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Click</span>
            <span className="text-white/20 text-[8px] sm:text-[9px] font-medium uppercase tracking-widest">Zoom Point</span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all group active:scale-95 pointer-events-auto"
      >
        <FontAwesomeIcon icon={faXmark} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
    </div>

    {/* Click-to-Zoom Viewport */}
    <div 
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${clickZoomDirection === "in" ? "cursor-zoom-in" : "cursor-zoom-out"}`}
      style={{ paddingTop: "8.5rem", paddingBottom: "7rem" }}
      onClick={(e) => {
        const nextZoom =
          clickZoomDirection === "in"
            ? Math.min(zoom + ZOOM_STEP, MAX_ZOOM)
            : Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
        if (nextZoom === zoom) return;

        setZoom(nextZoom);

        if (clickZoomDirection === "in") {
          // Recalculate pan so the clicked region moves toward center as we zoom in.
          const rect = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          const panScale = (nextZoom - 1) * 220;

          setPan({
            x: -nx * panScale,
            y: -ny * panScale,
          });
        } else {
          const ratio = nextZoom / zoom;
          setPan((prev) => ({ x: prev.x * ratio, y: prev.y * ratio }));
        }

        if (nextZoom >= MAX_ZOOM) {
          setClickZoomDirection("out");
        } else if (nextZoom <= MIN_ZOOM) {
          setClickZoomDirection("in");
        }
      }}
    >
      <div
        ref={imgRef}
        className="relative w-full h-full max-w-[96vw] max-h-[54vh] sm:max-w-[92vw] sm:max-h-[60vh] md:max-h-[68vh] lg:max-h-[74vh] flex items-center justify-center p-2 sm:p-6 md:p-10 pointer-events-none"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px) rotate(${rotation}deg)`,
          transition: "transform 0.5s cubic-bezier(0.2, 1, 0.2, 1)",
        }}
      >
        <Image
          src={currentImage}
          alt={`Specimen ${currentIndex + 1}`}
          fill
          className="object-contain select-none drop-shadow-2xl"
          quality={100}
          unoptimized
        />
      </div>
    </div>

    {/* Footer Dock */}
    <div className="absolute bottom-4 sm:bottom-10 flex flex-col items-center gap-4 sm:gap-6 z-[10000] px-2">
      {/* Pagination indicators */}
      {imagePaths.length > 1 && (
        <div className="flex gap-2 mb-2">
          {imagePaths.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === currentIndex ? "bg-[var(--accent-color)] w-8" : "bg-white/20 w-2"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 bg-[#1A1C16]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[24px] shadow-2xl">
        <div className="flex items-center gap-1 pr-2 border-r border-white/5">
          <button onClick={handlePrevImage} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white rounded-xl">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleNextImage} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white rounded-xl">
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed rounded-xl"
          >
            <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
          </button>
          <div className="w-14 text-center text-white/80 font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-widest">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed rounded-xl"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1 pl-2 border-l border-white/5">
          <button onClick={() => setRotation(r => (r + 90) % 360)} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-[var(--accent-color)] rounded-xl">
            <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDownload} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white rounded-xl">
            <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetImageState}
            className="ml-1 w-10 h-10 flex items-center justify-center bg-[var(--primary-color)] text-[var(--background-color)] rounded-xl hover:bg-[var(--accent-color)] transition-all"
          >
            <FontAwesomeIcon icon={faExpand} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</>
  );
}
