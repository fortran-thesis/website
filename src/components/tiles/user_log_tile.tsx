"use client";
import React from "react";

export interface UserLogTileEntry {
  date: string;
  time: string;
  description: string;
  href?: string | null;
}

interface UserLogTileProps {
  items: UserLogTileEntry[];
  onItemClick?: (entry: UserLogTileEntry) => void;
}

export default function UserLogTile({ items, onItemClick }: UserLogTileProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Table Header - Minimalist Editorial Style */}
      <div className="grid grid-cols-[100px_1fr_120px] gap-6 px-4 py-3 border-b border-[var(--primary-color)]/10 font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] text-[10px] uppercase tracking-[0.3em]">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]">Timestamp</span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]">Activity Description</span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]text-right">Reference</span>
      </div>

      <div className="flex flex-col">
        {items.map((entry, index) => {
          const isClickable = Boolean(entry.href && onItemClick);

          return (
          <div 
            key={index} 
            className={`grid grid-cols-[100px_1fr_120px] gap-6 items-center px-4 py-5 border-b border-[var(--primary-color)]/[0.04] transition-colors group ${
              isClickable
                ? 'hover:bg-[var(--primary-color)]/[0.02] cursor-pointer'
                : 'hover:bg-[var(--primary-color)]/[0.02] cursor-default'
            }`}
            onClick={() => {
              if (isClickable) onItemClick?.(entry);
            }}
            onKeyDown={(event) => {
              if (!isClickable) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onItemClick?.(entry);
              }
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
          >
            
            {/* 1. Time Column */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                {entry.time}
              </span>
              <span className="text-xs font-extrabold text-[var(--accent-color)] uppercase tracking-tighter font-[family-name:var(--font-bricolage-grotesque)]">
                {entry.date}
              </span>
            </div>

            {/* 2. Description Column (The Hero) */}
            <div className="flex items-center gap-4">
              {/* Subtle status node that only lights up on hover */}
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] opacity-10 group-hover:opacity-100 transition-opacity" />
              <p className="text-[13px] text-[var(--moldify-black)] font-medium font-[family-name:var(--font-bricolage-grotesque)] leading-snug">
                {entry.description}
              </p>
            </div>

            {/* 3. Action/Meta Column */}
            <div className="flex justify-end">
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                isClickable
                  ? 'text-[var(--primary-color)]/30 group-hover:text-[var(--primary-color)] group-hover:opacity-100'
                  : 'text-[var(--primary-color)]/20'
               }`}>
                {isClickable ? 'Open' : 'Details'}
              </span>
            </div>
            
          </div>
          );
        })}
      </div>
    </div>
  );
}