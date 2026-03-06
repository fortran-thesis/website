"use client";
import { useState, useEffect } from "react";

interface DropdownOption {
  label: string;
  value: string;
  variant?: "default" | "danger";
}

interface StatusDropdownProps {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  selectedValue?: string;
}

export default function StatusDropdown({ 
  options, 
  onSelect, 
  placeholder = "Select Action",
  backgroundColor = "var(--primary-color)",
  textColor = "white",
  borderColor,
  selectedValue
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string | undefined>(selectedValue);

  useEffect(() => {
    setLocalSelected(selectedValue);
  }, [selectedValue]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setLocalSelected(value);
    setIsOpen(false);
  };

  // Revert: always show placeholder on the closed button per request
  const displayText = placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs font-bold px-4 py-3 rounded-xl cursor-pointer outline-none hover:brightness-110 transition-all flex items-center justify-between font-[family-name:var(--font-bricolage-grotesque)]"
        style={{ 
          backgroundColor, 
          color: textColor,
          border: borderColor ? `2px solid ${borderColor}` : 'none'
        }}
      >
        <span className="truncate flex-1 text-left">{displayText}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background-color)] rounded-xl shadow-lg overflow-hidden z-20 border border-[var(--primary-color)]/10">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === (localSelected ?? selectedValue);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-3 text-xs transition-colors font-[family-name:var(--font-bricolage-grotesque)] break-words ${
                        option.variant === "danger"
                          ? "hover:bg-red-50 text-red-600"
                          : "hover:bg-[var(--taupe)] text-[var(--primary-color)]"
                      } ${isSelected ? 'font-black' : 'font-bold'}`}
                    style={isSelected ? { backgroundColor: textColor, color: backgroundColor } as any : undefined}
                  >
                      <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
