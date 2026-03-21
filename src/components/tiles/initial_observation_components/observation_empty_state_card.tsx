"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlaskVial } from "@fortawesome/free-solid-svg-icons";

/**
 * ObservationEmptyStateCard
 * * A reusable empty-state component displayed when observation sections
 * have no data available.
 */
interface ObservationEmptyStateCardProps {
  message: string;
  height?: number;
}

export default function ObservationEmptyStateCard({
  message,
  height = 100,
}: ObservationEmptyStateCardProps) {
  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full rounded-[2.5rem] border-2 border-dashed border-[var(--primary-color)]/10 bg-[var(--primary-color)]/[0.02] flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <FontAwesomeIcon
        icon={faFlaskVial}
        className="w-7 h-7 text-[var(--primary-color)]/20 group-hover:rotate-12 transition-transform duration-500"
      />

      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary-color)]/40 text-center px-10 leading-relaxed font-[family-name:var(--font-bricolage-grotesque)]">
        {message}
      </p>
    </div>
  );
}