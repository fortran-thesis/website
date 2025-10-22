"use client";

import { useState } from "react";
import Image from "next/image";

export interface TimelineEntry {
  date: string;
  imagePath: string;
  details: { label: string; value: string }[]; // dynamic label/value pairs
  notes?: { label: string; value: string };   // additional notes always below
}

interface ExperimentTimelineTileProps {
  entry: TimelineEntry;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ExperimentTimelineTile({
  entry,
  isFirst = false,
  isLast = false,
}: ExperimentTimelineTileProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative pl-6 mb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-0 top-1 bottom-0 bg-[var(--primary-color)]" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-[-7px] top-0 w-3 h-3 bg-[var(--primary-color)] rounded-full z-10" />

      {/* Entry content */}
      <div className="space-y-3">
        {/* DATE */}
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          {entry.date}
        </p>

        {/* IMAGE */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-shrink-0">
            <button onClick={() => setModalOpen(true)} className="focus:outline-none">
              <Image
                src={entry.imagePath}
                alt={`Timeline - ${entry.date}`}
                width={150}
                height={150}
                className="rounded-md object-cover border border-gray-200 hover:opacity-90 cursor-pointer"
              />
            </button>
          </div>

          {/* DETAILS */}
          <div className="flex flex-col flex-grow min-w-[200px] space-y-4">
            {/* First row: e.g., Colony Diameter + Colony Color */}
            <div className="flex justify-between gap-4">
              {entry.details.map((item, idx) => (
                <div key={idx}>
                  <p className="text-sm font-bold text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                    {item.label}
                  </p>
                  <p className="text-base font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            {entry.notes && (
              <div>
                <p className="text-sm font-bold text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                  {entry.notes.label}
                </p>
                <p className="text-base font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] leading-relaxed">
                  {entry.notes.value}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* IMAGE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-white text-3xl cursor-pointer"
            >
              &times;
            </button>
            <Image
              src={entry.imagePath}
              alt="Preview"
              width={600}
              height={400}
              className="object-contain max-h-[80vh] rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
