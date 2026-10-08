"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: Array<{ day: string; revenue: number }> }) {
  return (
    <div className="h-64 w-full overflow-x-auto">
      <div className="h-64 min-w-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#1E1B4B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
