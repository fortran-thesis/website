"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import ImageViewerModal from "@/components/tiles/initial_observation_components/image_viewer_modal";

interface CaseDetailsTabProps {
  entries: {
    date: string;
    notes: string;
    images: string[];
  }[];
 
}

export default function CaseDetailsTab({
  entries,
 
}: CaseDetailsTabProps) {
  return (
    <div className="overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">Case Details</h2>
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          View details reported by the farmer about the mold problem.
        </p>
      </div>


      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <FontAwesomeIcon icon={faCircleInfo} size="2x" />
          <p className="mt-2 text-sm">No information available.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[var(--primary-color)] border-primary space-y-10 ml-5">
          {entries
            .slice()
            .reverse()
            .map((entry, index) => (
              <CaseTimelineTile
                key={index}
                dateTime={entry.date}
                notes={entry.notes}
                imageUrls={entry.images}
                isLast={index === entries.length - 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/* ===============================
   Timeline Tile Component
================================ */
function CaseTimelineTile({
  dateTime,
  notes,
  imageUrls,
  isLast,
}: {
  dateTime: string;
  notes: string;
  imageUrls: string[];
  isLast: boolean;
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative pl-6">
       {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-0 top-1 bottom-0 w-[2px]"></div>
      )}

      {/* Timeline dot */}
      <div className="absolute left-[-7px] top-0.1 w-3 h-3 bg-[var(--primary-color)] rounded-full z-10"></div>

      {/* Entry content */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">{dateTime}</p>

        <div>
          <p className="text-sm font-bold font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">Problem Description:</p>
          <p className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed break-words">{notes}</p>
        </div>

        {/* Images */}
        {imageUrls && imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {imageUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setModalOpen(true);
                }}
                className="focus:outline-none hover:opacity-90 transition-opacity"
              >
                <Image
                  src={url}
                  alt={`Case image ${idx + 1}`}
                  width={150}
                  height={150}
                  className="rounded-xl object-cover border border-[var(--primary-color)]/10 shadow-sm hover:shadow-md transition-shadow"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-[var(--moldify-grey)]">
            <FontAwesomeIcon icon={faCircleInfo} size="lg" />
            <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)]">No images were provided.</p>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isModalOpen}
        imagePaths={imageUrls}
        initialIndex={currentIndex}
        onClose={() => setModalOpen(false)}
        title="Case Images"
      />
    </div>
  );
}
