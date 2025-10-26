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
}

export default function TabBar({ tabs, initialIndex = 0 }: TabBar) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <div className="flex flex-col h-full">
      {/* --- TAB HEADER --- */}
      <div className="flex border-b border-[var(--moldify-softGrey)]">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
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
      <div className="flex-1 p-4">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
