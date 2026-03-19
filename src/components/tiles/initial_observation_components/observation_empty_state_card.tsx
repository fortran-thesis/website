"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlaskVial } from "@fortawesome/free-solid-svg-icons";

/**
 * ObservationEmptyStateCard
 * 
 * A reusable empty-state component displayed when observation sections
 * have no data available. Provides visual feedback with an icon and
 * instructional message to guide users.
 * 
 * @component
 * @interface
 * @property {string} message - Instructional or contextual text displayed below the icon
 * @property {number} [height] - Card height in pixels (default: 100px)
 * 
 * @example
 * ```tsx
 * <ObservationEmptyStateCard
 *   message="No microscopic analysis recorded yet"
 *   height={120}
 * />
 * ```
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
      className="w-full rounded-2xl border-2 border-dashed border-[var(--primary-color)]/10 bg-[var(--primary-color)]/[0.03] flex flex-col items-center justify-center gap-2"
    >
      {/* Icon */}
      <FontAwesomeIcon
        icon={faFlaskVial}
        className="w-8 h-8 text-[var(--primary-color)]/40"
      />

      {/* Message */}
      <p className="text-sm text-[var(--primary-color)]/50 text-center px-4 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
