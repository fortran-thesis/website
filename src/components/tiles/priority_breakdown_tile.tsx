"use client";

import React from "react";

interface PriorityData {
  high: number;
  medium: number;
  low: number;
}

interface PriorityBreakdownProps {
  data: PriorityData;
  title?: string;
}

export default function PriorityBreakdown({
  data,
  title = "Priority Level Breakdown",
}: PriorityBreakdownProps) {
  const totalCases = data.high + data.medium + data.low;

  const getPercentage = (count: number) =>
    totalCases === 0 ? 0 : Math.round((count / totalCases) * 100);

  const priorities = [
    {
      label: "High Priority",
      color: "var(--moldify-light-red)",
      dot: "var(--moldify-light-red)",
      count: data.high,
      percent: getPercentage(data.high),
    },
    {
      label: "Medium Priority",
      color: "var(--moldify-light-yellow)",
      dot: "var(--moldify-light-yellow)",
      count: data.medium,
      percent: getPercentage(data.medium),
    },
    {
      label: "Low Priority",
      color: "var(--moldify-light-green)",
      dot: "var(--moldify-light-green)",
      count: data.low,
      percent: getPercentage(data.low),
    },
  ];

  return (
    <div className="w-full bg-[var(--background-color)] rounded-xl px-4">
      <h2 className="font-[family-name:var(--font-bricolage-grotesque)] font-extrabold text-[var(--primary-color)] mb-4">
        {title}
      </h2>

      {priorities.map((p, i) => (
        <div key={i} className="mb-6 last:mb-0 font-[family-name:var(--font-bricolage-grotesque)]">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              {/* dot */}
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.dot }}
              ></span>

              <span className="font-semibold text-[var(--moldify-black)] text-sm">
                {p.label}
              </span>
            </div>
            <span className="font-bold text-[var(--moldify-black)]">
              {p.count}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[var(--moldify-softGrey)] h-3 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${p.percent}%`,
                backgroundColor: p.color,
              }}
            ></div>
          </div>

          {/* Percentage text */}
          <p className="text-xs text-[var(--moldify-grey)] mt-1">
            {p.percent}% of total cases
          </p>
        </div>
      ))}

      <hr className="my-3 border-gray-400" />

      <div className="flex justify-between font-semibold">
        <span className="font-[family-name:var(--font-bricolage-grotesque)]">
          Total Cases:
        </span>
        <span className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black">
          {totalCases}
        </span>
      </div>
    </div>
  );
}
