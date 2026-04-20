"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPalette,
  faCubes,
  faHeartPulse,
  faStethoscope,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import ObservationImageViewer from "../../../components/tiles/initial_observation_components/observation_image_viewer";
import ImageViewerModal from "../../../components/tiles/initial_observation_components/image_viewer_modal";
import ObservationDataTile from "../../../components/tiles/initial_observation_components/observation_data_tile";
import ObservationEmptyStateCard from "../../../components/tiles/initial_observation_components/observation_empty_state_card";

/**
 * InitialObservationTabProps
 *
 * Props for displaying initial microscopic and macroscopic observations
 * captured during the case setup phase.
 *
 * This tab presents baseline observation data in a read-only format,
 * focusing on the microscopic identification and macroscopic characteristics
 * of the mold specimen.
 *
 * @interface
 * @property {string} microscopicImagePath - Path to microscopic image (asset, URL, or local path)
 * @property {string} macroscopicImagePath - Path to macroscopic image (asset, URL, or local path)
 * @property {string} [identifiedMold] - Mold species name identified by scan (e.g., "Aspergillus fumigatus")
 * @property {string} [confidence] - Confidence percentage (e.g., "87%")
 * @property {string} [macroColor] - Macroscopic colony color observation
 * @property {string} [macroTexture] - Macroscopic texture characteristics
 * @property {string | string[]} [macroSymptoms] - Host symptoms (array recommended)
 * @property {string | string[]} [macroSigns] - Host signs (array recommended)
 * @property {string | string[]} [macroCharacteristics] - Mold characteristics (array recommended)
 * @property {string} [emptyMicroscopicMessage] - Custom message for empty microscopic state
 * @property {string} [emptyMacroscopicMessage] - Custom message for empty macroscopic state
 */
interface InitialObservationTabProps {
  microscopicImagePath?: string;
  macroscopicImagePath?: string;
  identifiedMold?: string;
  confidence?: string;
  macroColor?: string;
  macroTexture?: string;
  macroSymptoms?: string | string[];
  macroSigns?: string | string[];
  macroCharacteristics?: string | string[];
  emptyMicroscopicMessage?: string;
  emptyMacroscopicMessage?: string;
}

/**
 * InitialObservationTab Component
 *
 * Displays the baseline microscopic and macroscopic observations recorded
 * during the "Set Monitoring Details" step when a mold case is created.
 *
 * This is a read-only presentation component that shows:
 * - Microscopic image with overlaid identified mold species and confidence
 * - Macroscopic image with data tiles below (Color, Texture, Symptoms, Signs, Characteristics)
 *
 * Both sections support flexible image sources (assets, URLs, local paths)
 * and display fallback states when data is unavailable.
 *
 * @component
 * @example
 * ```tsx
 * <InitialObservationTab
 *   microscopicImagePath="/images/microscopic-001.jpg"
 *   macroscopicImagePath="/images/macroscopic-001.jpg"
 *   identifiedMold="Aspergillus fumigatus"
 *   confidence="87%"
 *   macroColor="White with yellow spots"
 *   macroTexture="Powdery"
 *   macroSymptoms="Leaf necrosis, wilting"
 *   macroCharacteristics="Granular appearance"
 * />
 * ```
 */
export default function InitialObservationTab({
  microscopicImagePath = "",
  macroscopicImagePath = "",
  identifiedMold = "",
  confidence = "",
  macroColor = "",
  macroTexture = "",
  macroSymptoms = "",
  macroSigns = "",
  macroCharacteristics = "",
  emptyMicroscopicMessage = "No microscopic analysis recorded",
  emptyMacroscopicMessage = "No macroscopic analysis recorded",
}: InitialObservationTabProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  /**
   * Check if microscopic data is available
   */
  const hasMicroscopicImage = (microscopicImagePath ?? "").trim().length > 0;

  /**
   * Check if macroscopic data is available
   */
  const hasMacroscopicImage = (macroscopicImagePath ?? "").trim().length > 0;

  /**
   * Collect all available images for gallery viewing
   */
  const allDiagnosticImages = [
    ...(hasMicroscopicImage ? [microscopicImagePath] : []),
    ...(hasMacroscopicImage ? [macroscopicImagePath] : []),
  ].filter((path) => (path ?? "").trim().length > 0);

  const openGallery = (imageIndex: number) => {
    setGalleryStartIndex(imageIndex);
    setGalleryOpen(true);
  };

  return (
    <>
      {/* Gallery Viewer Modal for viewing all diagnostic images */}
      <ImageViewerModal
        isOpen={galleryOpen}
        imagePaths={allDiagnosticImages}
        initialIndex={galleryStartIndex}
        onClose={() => setGalleryOpen(false)}
        title="Initial Diagnosis Gallery"
      />

      <div className="overflow-y-auto space-y-8">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PAGE HEADER */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
            Initial Diagnosis
          </h2>
          <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
            Baseline microscopic and macroscopic data captured during setup
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 1: INITIAL MICROSCOPIC */}
        {/* Displays microscopic image with identified mold overlay */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="font-semibold text-base text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
            Initial Microscopic
          </h3>

          {hasMicroscopicImage ? (
            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-[var(--primary-color)]/[0.03] border-2 border-[var(--primary-color)]/10">
              {/* Image container */}
              <ObservationImageViewer
                imagePath={microscopicImagePath}
                objectFit="cover"
              />

              {/* Identified mold overlay at bottom */}
              {(identifiedMold || confidence) && (
                <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-black/40 px-5 py-4 flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-white flex-1 pr-2 font-[family-name:var(--font-bricolage-grotesque)]">
                    {(identifiedMold ?? "").trim().length > 0
                      ? identifiedMold
                      : "Pending Analysis"}
                  </p>
                  {(confidence ?? "").trim().length > 0 && (
                    <p className="text-xs sm:text-sm font-black text-[var(--accent-color)] font-[family-name:var(--font-montserrat)] tracking-tight">
                      {confidence}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <ObservationEmptyStateCard
              message={emptyMicroscopicMessage}
              height={160}
            />
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* SECTION 2: INITIAL MACROSCOPIC */}
        {/* Image with 4 data tiles in 2x2 grid */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="font-semibold text-base text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
            Initial Macroscopic
          </h3>

          <div className="rounded-[2.5rem] overflow-hidden border-2 border-[var(--primary-color)]/10 bg-[var(--background-color)]">
            {/* Macroscopic image */}
            {hasMacroscopicImage ? (
              <div className="relative w-full aspect-video overflow-hidden">
                <ObservationImageViewer
                  imagePath={macroscopicImagePath}
                  objectFit="cover"
                />
              </div>
            ) : (
              <div className="bg-[var(--primary-color)]/[0.03] border-b-2 border-[var(--primary-color)]/10 h-48 flex items-center justify-center">
                <ObservationEmptyStateCard
                  message={emptyMacroscopicMessage}
                  height={120}
                />
              </div>
            )}

            {/* Data tiles grid */}
            <div className="p-5 grid grid-cols-2 gap-3">
              <ObservationDataTile
                label="Color"
                value={macroColor}
                icon={faPalette}
              />
              <ObservationDataTile
                label="Texture"
                value={macroTexture}
                icon={faCubes}
              />
              <ObservationDataTile
                label="Symptoms"
                value={macroSymptoms}
                icon={faHeartPulse}
              />
              <ObservationDataTile
                label="Signs"
                value={macroSigns}
                icon={faStethoscope}
              />
              <div className="col-span-2">
                <ObservationDataTile
                  label="Characteristics"
                  value={macroCharacteristics}
                  icon={faFlask}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

