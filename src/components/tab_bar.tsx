"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface TabItem {
  label: string;
  icon?: IconDefinition;
  content: React.ReactNode;
}

interface TabBar {
  tabs: TabItem[];
  initialIndex?: number;
  onTabChange?: (index: number) => void;
}

export default function TabBar({ tabs, initialIndex = 0, onTabChange }: TabBar) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* --- TAB HEADER --- */}
      <div className="flex border-b border-[var(--moldify-softGrey)] flex-shrink-0">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                onTabChange?.(index);
              }}
              className={`font-[family-name:var(--font-bricolage-grotesque)] flex items-center gap-2 px-6 py-3 font-medium text-base transition-colors duration-200 cursor-pointer
                ${
                  isActive
                    ? "text-[var(--primary-color)] border-b-4 border-[var(--accent-color)]"
                    : "text-[var(--moldify-grey)] hover:text-[var(--primary-color)]"
                }`}
            >
              {tab.icon && (
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`${
                    isActive ? "text-[var(--primary-color)]" : "text-gray-400 hover:text-[var(--primary-color)]"
                  }`}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- TAB CONTENT --- */}
      <div 
        className="flex-1 p-4 bg-[var(--background-color)] overflow-hidden"
      >
        <div key={activeIndex} className="h-full w-full overflow-y-auto">
          {tabs[activeIndex]?.content}
        </div>
      </div>
    </div>
  );
}
