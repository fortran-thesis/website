"use client";

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * ObservationDataTile
 * * A reusable tonal tile component for displaying observation metadata
 * such as color, texture, symptoms, and characteristics.
 * * Displays a field label, icon, and value with automatic fallback
 * when the value is empty or contains only whitespace.
 * * @component
 * @interface
 * @property {string} label - Field title displayed in uppercase (e.g., "Color", "Texture")
 * @property {string | string[]} value - Field value to display; arrays are joined with commas
 * @property {IconDefinition} icon - FontAwesome icon to display as the leading visual element
 * @property {string} [fallbackValue] - Text shown when value is empty (default: "---")
 */
interface ObservationDataTileProps {
  label: string;
  value: string | string[];
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
   * Normalize value(s): support both plain strings and string arrays,
   * then use fallback when no non-empty content exists.
   * Prevents displaying empty strings and maintains consistent UI
   */
  const normalized = Array.isArray(value)
    ? value
        .map((item) => (item ?? "").trim())
        .filter((item) => item.length > 0)
        .join(", ")
    : (value ?? "").trim();
  const displayValue = normalized.length > 0 ? normalized : fallbackValue;

  return (
    <div className="group relative flex flex-col p-6 rounded-[2.5rem] bg-gradient-to-br from-[var(--primary-color)]/[0.03] to-transparent border border-[var(--primary-color)]/5 hover:border-[var(--primary-color)]/20 transition-all duration-700 hover:shadow-2xl hover:shadow-[var(--primary-color)]/[0.05]">
      
      {/* Editorial Top Section: Icon and Label on one line with a divider */}
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon 
          icon={icon} 
          className="w-3.5 h-3.5 text-[var(--primary-color)] opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
        />
        <div className="h-[1px] w-4 bg-[var(--primary-color)]/10" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/30 font-[family-name:var(--font-bricolage-grotesque)]">
          {label}
        </span>
      </div>

      {/* Value: Using Bricolage Grotesque with tighter leading for that high-end look */}
      <div className="relative">
        {/* Subtle background text for depth */}
        <span className="absolute -top-4 -left-2 text-4xl font-black text-[var(--primary-color)]/[0.02] font-[family-name:var(--font-bricolage-grotesque)] uppercase select-none group-hover:opacity-5 transition-opacity">
          {label.charAt(0)}
        </span>
        
        <p className="relative text-lg font-bold text-[var(--primary-color)] leading-[1.2] tracking-tight font-[family-name:var(--font-bricolage-grotesque)]">
          {displayValue}
        </p>
      </div>

      {/* Modern bottom accent line */}
      <div className="mt-4 w-0 h-[1.5px] bg-[var(--accent-color)] group-hover:w-full transition-all duration-700 ease-in-out opacity-40" />
    </div>
  );
}