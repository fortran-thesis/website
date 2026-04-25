"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface DonutChartProps {
  title: string;
  data: DonutChartData[];
  defaultColors?: string[];
  backgroundColor?: string;
}

export default function DonutChart({
  title,
  data,
  defaultColors = ["#E14C3E", "#2C4000"],
  backgroundColor = "var(--taupe)",
}: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <div
      className="rounded-3xl p-6 w-full h-full min-h-[260px] shadow-sm flex flex-col"
      style={{ backgroundColor }}
    >
      <h2 className="text-[var(--primary-color)] font-extrabold text-xl font-[family-name:var(--font-bricolage-grotesque)] text-center md:text-left">
        {title}
      </h2>

      <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center gap-10 pt-6">
        {/* Chart Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[170px] h-[170px] lg:w-[190px] lg:h-[190px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={4}
                  stroke="none"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || defaultColors[index % defaultColors.length]}
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[var(--primary-color)] font-black text-2xl leading-none font-[family-name:var(--font-montserrat)]">
                {total}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[var(--primary-color)]/70 font-[family-name:var(--font-montserrat)] font-black">
                Total
              </span>
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="flex flex-col justify-center gap-4 min-w-[160px]">
          {data.map((item, index) => {
            if (item.hideFromLegend) return null;
            const color = item.color || defaultColors[index % defaultColors.length];
            const percent = total > 0 ? Math.round((Number(item.value) / total) * 100) : 0;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex flex-col">
                  <span className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold leading-tight">
                    {percent}%
                  </span>
                  <span className="text-[var(--primary-color)] opacity-70 font-[family-name:var(--font-bricolage-grotesque)] text-[10px] uppercase tracking-wider">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
