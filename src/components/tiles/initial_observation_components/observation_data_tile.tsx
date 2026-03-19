"use client";

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * ObservationDataTile
 * 
 * A reusable tonal tile component for displaying observation metadata
 * such as color, texture, symptoms, and characteristics.
 * 
 * Displays a field label, icon, and value with automatic fallback
 * when the value is empty or contains only whitespace.
 * 
 * @component
 * @interface
 * @property {string} label - Field title displayed in uppercase (e.g., "Color", "Texture")
 * @property {string} value - The field value to display; shows fallback when blank
 * @property {IconDefinition} icon - FontAwesome icon to display as the leading visual element
 * @property {string} [fallbackValue] - Text shown when value is empty (default: "---")
 * 
 * @example
 * ```tsx
 * <ObservationDataTile
 *   label="Color"
 *   value="White with yellow spots"
 *   icon={faPalette}
 *   fallbackValue="Not recorded"
 * />
 * ```
 */
interface ObservationDataTileProps {
  label: string;
  value: string;
  icon: IconDefinition;
  fallbackValue?: string;
}

export default function ObservationDataTile({
  label,
  value,
  icon,
  fallbackValue = "---",
}: ObservationDataTileProps) {
  /**
   * Normalize value: trim whitespace and use fallback if empty
   * Prevents displaying empty strings and maintains consistent UI
   */
  const normalized = (value ?? "").trim();
  const displayValue = normalized.length > 0 ? normalized : fallbackValue;

  return (
    <div className="flex-1 p-3.5 rounded-2xl border-2 border-[var(--primary-color)]/10 bg-[var(--primary-color)]/[0.04] space-y-2">
      {/* Icon */}
      <FontAwesomeIcon
        icon={icon}
        className="w-4 h-4 text-[var(--primary-color)]"
      />

      {/* Label */}
      <p className="text-[9px] font-black uppercase tracking-wider text-[var(--primary-color)]/50">
        {label}
      </p>

      {/* Value */}
      <p className="text-sm font-semibold text-[var(--primary-color)] leading-relaxed">
        {displayValue}
      </p>
    </div>
  );
}
