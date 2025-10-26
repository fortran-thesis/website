"use client";
import React from "react";

interface StatusBoxProps {
  status: string;
  fontSize?: string;
}

export default function StatusBox({ status, fontSize = "0.75rem" }: StatusBoxProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "var(--accent-color)";
      case "in progress":
        return "var(--moldify-blue)";
      case "resolved": case "active":
        return "var(--primary-color)";
      case "closed":
        return "var(--moldify-grey)";
      case "rejected": case "inactive": case "unresolved":
        return "var(--moldify-red)";
      case "low priority":
        return "var(--moldify-light-green)";
      case "medium priority":
        return "var(--moldify-light-yellow)";
      case "high priority":
        return "var(--moldify-light-red)";
      default:
        return "rgba(0, 0, 0, 0.15)";
    }
  };

  const textColor =
    ["pending", "low priority", "medium priority", "high priority"].includes(
      status.toLowerCase()
    )
      ? "var(--moldify-black)"
      : "var(--background-color)";

  return (
    <div
      className="inline-block py-1 px-7 rounded-full text-center"
      style={{
        backgroundColor: getStatusColor(status),
        color: textColor,
        fontSize: fontSize,
        fontFamily: "Bricolage Grotesque, sans-serif",
        fontWeight: 700,
      }}
    >
      {status}
    </div>
  );
}
