"use client";

import React from "react";

export interface UserLogTileEntry {
  date: string;
  time: string;
  description: string;
}

interface UserLogTileProps {
  items: UserLogTileEntry[];
}

export default function UserLogTile({ items }: UserLogTileProps) {
  // Handle empty state
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-[var(--moldify-grey)] italic">
        No logs available yet.
      </p>
    );
  }

  return (
    <div className="relative">
      {items.map((entry, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="relative pl-6 pb-8">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-[5px] top-1 bottom-0 w-[1px] bg-[var(--primary-color)]" />
            )}

            {/* Dot */}
            <div className="absolute left-0 w-3 h-3 bg-[var(--primary-color)] rounded-full z-10" />

            {/* Content */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                <span className="font-medium">{entry.date}</span>
                <span className="mx-2 text-[var(--moldify-grey)] ">•</span>
                <span>{entry.time}</span>
              </div>

              <p className="text-sm text-[var(--moldify-black)] leading-relaxed font-[family-name:var(--font-bricolage-grotesque)]">
                {entry.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
