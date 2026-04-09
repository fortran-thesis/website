"use client";
import React from "react";

interface StatusBoxProps {
  status: string;
  fontSize?: string;
}

export default function StatusBox({ status, fontSize = "10px" }: StatusBoxProps) {
  const getStatusTheme = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      // 01. SUCCESS / COMPLETED (Deep Forest Green)
      case "resolved": case "active": case "low":
        return { dot: "#3E5C0A", bg: "rgba(62, 92, 10, 0.05)", text: "#3E5C0A" };
      
      // 02. ATTENTION / DRAFT (Burnt Gold/Accent)
      case "pending": case "draft": case "medium":
        return { dot: "var(--accent-color)", bg: "rgba(180, 140, 50, 0.05)", text: "var(--accent-color)" };
      
      // 03. IN PROGRESS (Deep Navy/Slate)
      case "in progress":
        return { dot: "#1e40af", bg: "rgba(30, 64, 175, 0.05)", text: "#1e40af" };
      
      // 04. CRITICAL / INACTIVE (Deep Crimson)
      case "high": case "rejected": case "inactive": case "unresolved":
        return { dot: "#991b1b", bg: "rgba(153, 27, 27, 0.05)", text: "#991b1b" };
      
      // 05. NEUTRAL / ARCHIVED
      default:
        return { dot: "#64748b", bg: "rgba(100, 116, 139, 0.05)", text: "#64748b" };
    }
  };

  const theme = getStatusTheme(status);

  return (
    <div 
      className="inline-flex min-w-[9rem] justify-center items-center gap-3 px-5 py-2 rounded-full border border-[var(--primary-color)]/5"
      style={{ 
        backgroundColor: theme.bg,
        backdropFilter: "blur(12px)", // Premium 'Nordic Glass' feel
      }}
    >
      {/* Tiny Pulse Indicator */}
      <div 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: theme.dot }} 
      />

      {/* High-End Editorial Typography */}
      <span 
        className="font-black uppercase leading-none"
        style={{ 
          fontSize: fontSize, 
          color: theme.text,
          fontFamily: "var(--font-bricolage-grotesque), sans-serif",
          opacity: 0.9
        }}
      >
        {status}
      </span>
    </div>
  );
}