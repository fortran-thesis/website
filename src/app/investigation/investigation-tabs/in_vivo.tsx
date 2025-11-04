"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlaskVial } from "@fortawesome/free-solid-svg-icons";
import TimelineTile, { TimelineEntry } from "@/components/tiles/timeline_tile";

interface InVivoEntry {
  date: string;
  imagePath: string;
  sizeValue: string;
  colorValue: string;
  notes: string;
}

interface InVivoTabProps {
  dateTime: string;
  environmentalTemperature: string;
  inVivoEntries: InVivoEntry[];
  emptyMessage?: string; // Custom empty state message
}

export default function InVivoTab({
  dateTime,
  environmentalTemperature,
  inVivoEntries,
  emptyMessage,
}: InVivoTabProps) {

  const timelineEntries: TimelineEntry[] = (inVivoEntries ?? []).map(e => ({
  date: e.date,
  imagePath: e.imagePath,
  details: [
    { label: "Lesion Size", value: e.sizeValue },
    { label: "Lesion Color", value: e.colorValue },
  ],
  notes: e.notes ? { label: "Additional Notes", value: e.notes } : undefined,
}));

  return (
    <div className="overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
          In Vivo
        </h2>
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          {dateTime}
        </p>
      </div>

      {/* Environmental Temperature - Only show if value exists */}
      {environmentalTemperature && (
        <div className="flex flex-col justify-between mt-3">
          <p className="text-sm  text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
            Environmental Temperature
          </p>
          <p className="text-base font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
            {environmentalTemperature}
          </p>
        </div>
      )}

      {/* Empty State */}
      {inVivoEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <FontAwesomeIcon icon={faFlaskVial} size="2x" />
          <p className="mt-2 text-sm">{emptyMessage || "No entries made yet."}</p>
        </div>
      )}

      {/* Timeline */}
      <ol className="relative border-l-2 border-[var(--primary-color)] ml-5">
        {timelineEntries.map((entry, idx) => (
          <TimelineTile
            key={idx}
            entry={entry}
            isLast={idx === timelineEntries.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}
