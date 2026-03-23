"use client";

import {
  faPalette,
  faCubes,
  faHeartPulse,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import ObservationImageViewer from "../../../components/tiles/initial_observation_components/observation_image_viewer";
import ObservationDataTile from "../../../components/tiles/initial_observation_components/observation_data_tile";
import ObservationEmptyStateCard from "../../../components/tiles/initial_observation_components/observation_empty_state_card";

/**
 * InVitroObservation
 *
 * Represents a single in vitro cultivation observation with microscopic and macroscopic data
 * matching the Initial Observation data structure for tracking changes over cultivation period
 *
 * @interface
 * @property {string} date - Formatted date/time of the observation
 * @property {string} microscopicImagePath - Path to microscopic image (asset, URL, or local path)
 * @property {string} identifiedMold - Mold species identified in microscopic analysis
 * @property {string} confidence - Confidence percentage of identification
 * @property {string} macroscopicImagePath - Path to macroscopic image (asset, URL, or local path)
 * @property {string} macroColor - Macroscopic colony color observation
 * @property {string} macroTexture - Macroscopic texture characteristics
 * @property {string | string[]} macroSymptoms - Symptoms or characteristics on culture medium
 * @property {string | string[]} macroCharacteristics - Mold characteristics observed macroscopically
 */
interface InVitroObservation {
  date: string;
  microscopicImagePath: string;
  identifiedMold: string;
  confidence: string;
  macroscopicImagePath: string;
  macroColor: string;
  macroTexture: string;
  macroSymptoms: string | string[];
  macroCharacteristics: string | string[];
}

/**
 * InVitroTabProps
 *
 * Props for the In Vitro cultivation observations tab component
 *
 * @interface
 * @property {string} [dateTime] - Cultivation period or start date description
 * @property {InVitroObservation[]} [observations] - Array of cultivation observation entries with microscopic/macroscopic data
 * @property {string} [emptyMessage] - Custom message shown when no observations available
 */
interface InVitroTabProps {
  dateTime?: string;
  observations?: InVitroObservation[];
  emptyMessage?: string;
}

/**
 * InVitroTab Component
 *
 * Displays in vitro cultivation observations with microscopic and macroscopic data
 * matching Initial Observation visual style. Shows timeline of observations, each with:
 * - Microscopic image with identified mold and confidence overlay
 * - Macroscopic image with 4 data tiles (Color, Texture, Symptoms, Characteristics)
 *
 * Structure:
 * 1. Page header with cultivation period
 * 2. Timeline of cultivation observations (each with microscopic + macroscopic sections)
 *
 * @component
 * @example
 * ```tsx
 * <InVitroTab
 *   dateTime="Started: March 10, 2024"
 *   observations={[...]}
 * />
 * ```
 */
export default function InVitroTab({
  dateTime,
  observations = [],
  emptyMessage = "No in vitro cultivation observations recorded",
}: InVitroTabProps) {
  const displayDatetime = (dateTime ?? "").trim().length > 0
    ? dateTime
    : "Cultivation observations timeline";
  const displayObservations = observations ?? [];

  return (
    <div className="overflow-y-auto space-y-8">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* PAGE HEADER */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
          In Vitro
        </h2>
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          {displayDatetime}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* OBSERVATIONS TIMELINE */}
      {/* Each observation displays microscopic + macroscopic data like Initial Observation */}
      {/* ─────────────────────────────────────────────────────────────── */}
      {displayObservations.length === 0 ? (
        <ObservationEmptyStateCard message={emptyMessage} height={160} />
      ) : (
        <div>
          {displayObservations.map((obs, idx) => (
            <div
              key={idx}
              className={`relative pl-7 space-y-6 ${idx !== displayObservations.length - 1 ? "mb-8" : ""}`}
            >
              {(() => {
                const hasMicroscopicEvidence =
                  (obs.microscopicImagePath ?? "").trim().length > 0 ||
                  (obs.identifiedMold ?? "").trim().length > 0 ||
                  (obs.confidence ?? "").trim().length > 0;
                const hasMacroscopicEvidence =
                  (obs.macroscopicImagePath ?? "").trim().length > 0 ||
                  (obs.macroColor ?? "").trim().length > 0 ||
                  (obs.macroTexture ?? "").trim().length > 0 ||
                  (Array.isArray(obs.macroSymptoms)
                    ? obs.macroSymptoms.length > 0
                    : (obs.macroSymptoms ?? "").trim().length > 0) ||
                  (Array.isArray(obs.macroCharacteristics)
                    ? obs.macroCharacteristics.length > 0
                    : (obs.macroCharacteristics ?? "").trim().length > 0);

                return (
                  <>
              {/* Timeline dot and connector */}
              <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-[var(--primary-color)]"></div>
              {idx !== displayObservations.length - 1 && (
                <div className="absolute left-[5px] top-[6px] h-[calc(100%+2rem)] w-[2px] bg-[var(--primary-color)]/30"></div>
              )}

              <p className="text-xs font-semibold text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                {obs.date}
              </p>

              {/* MICROSCOPIC SECTION */}
              {hasMicroscopicEvidence && (
              <section className="space-y-3">
                <h3 className="font-semibold text-base text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                  Microscopic Analysis
                </h3>

                {(obs.microscopicImagePath ?? "").trim().length > 0 ? (
                  <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-2 border-[var(--primary-color)]/20">
                    <ObservationImageViewer
                      imagePath={obs.microscopicImagePath}
                      objectFit="cover"
                    />

                    {/* Identified mold overlay at bottom */}
                    {(obs.identifiedMold || obs.confidence) && (
                      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-black/40 px-5 py-4 flex items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm font-semibold text-white flex-1 pr-2 font-[family-name:var(--font-bricolage-grotesque)]">
                          {(obs.identifiedMold ?? "").trim().length > 0
                            ? obs.identifiedMold
                            : "Pending Analysis"}
                        </p>
                        {(obs.confidence ?? "").trim().length > 0 && (
                          <p className="text-xs sm:text-sm font-black text-[var(--accent-color)] font-[family-name:var(--font-montserrat)] tracking-tight">
                            {obs.confidence}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <ObservationEmptyStateCard
                    message="No microscopic image recorded"
                    height={160}
                  />
                )}
              </section>
              )}

              {/* MACROSCOPIC SECTION */}
              {hasMacroscopicEvidence && (
              <section className="space-y-3">
                <h3 className="font-semibold text-base text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                  Macroscopic Characteristics
                </h3>

                {(obs.macroscopicImagePath ?? "").trim().length > 0 ? (
                  <div className="rounded-[2.5rem] overflow-hidden border-2 border-[var(--primary-color)]/20 bg-[var(--background-color)]">
                    {/* Image */}
                    <div className="relative w-full aspect-video overflow-hidden">
                      <ObservationImageViewer
                        imagePath={obs.macroscopicImagePath}
                        objectFit="cover"
                      />
                    </div>

                    {/* Data tiles in 2x2 grid */}
                    <div className="p-5 grid grid-cols-2 gap-3">
                      <ObservationDataTile
                        label="Color"
                        value={obs.macroColor}
                        icon={faPalette}
                      />
                      <ObservationDataTile
                        label="Texture"
                        value={obs.macroTexture}
                        icon={faCubes}
                      />
                      <ObservationDataTile
                        label="Symptoms"
                        value={obs.macroSymptoms}
                        icon={faHeartPulse}
                      />
                      <ObservationDataTile
                        label="Characteristics"
                        value={obs.macroCharacteristics}
                        icon={faFlask}
                      />
                    </div>
                  </div>
                ) : (
                  <ObservationEmptyStateCard
                    message="No macroscopic analysis recorded"
                    height={160}
                  />
                )}
              </section>
              )}

              {!hasMicroscopicEvidence && !hasMacroscopicEvidence && (
                <ObservationEmptyStateCard
                  message="No microscopic or macroscopic evidence in this log"
                  height={120}
                />
              )}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
