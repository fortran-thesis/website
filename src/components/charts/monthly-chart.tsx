"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyCasesChartProps {
  data: { month: string; cases: number }[];
  color?: string;
  textColor?: string;
  fillColor?: string;
  title?: string;
}

export default function MonthlyCasesChart({
  data,
  textColor = "var(--moldify-black)", // axis labels
  color = "var(--primary-color)", // dark green
  fillColor = "#9abf73", // light green
  title = "Mold Cases Per Month",
}: MonthlyCasesChartProps) {
  return (
    <div className="w-full bg-[var(--background-color)]">
      <h2 className="font-[family-name:var(--font-bricolage-grotesque)] font-extrabold text-[var(--primary-color)] mb-2">
        {title}
      </h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" className={"font-[family-name:var(--font-bricolage-grotesque)] text-xs text-[var(--moldify-black)]"}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="bg-transparent" />
            <XAxis dataKey="month" stroke={textColor} tick={{ fill: textColor }} />
            <YAxis stroke={textColor} tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background-color)",
                borderRadius: "8px",
                fontFamily: "var(--font-bricolage-grotesque)",
                color: "var(--moldify-black)",
              }}
            />

            <Area
              type="monotone"
              dataKey="cases"
              stroke={color}
              fillOpacity={1}
              fill="url(#colorCases)"
              activeDot={{ r: 6 }}
              dot={{ r: 4, fill: color, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
