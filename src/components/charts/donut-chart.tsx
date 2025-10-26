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
  return (
    <div
      className="rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 w-full"
      style={{ backgroundColor }}
    >
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-[var(--primary-color)] font-extrabold mb-4 font-[family-name:var(--font-bricolage-grotesque)]">
          {title}
        </h2>

        <div className="w-[140px] h-[140px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || defaultColors[index % defaultColors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor:
                  item.color || defaultColors[index % defaultColors.length],
              }}
            />
            <span className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm">
              {item.value} {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
