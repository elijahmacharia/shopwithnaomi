"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function shillings(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  return `KSh ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SalesChart({ data }: { data: Array<{ day: string; revenue: number }> }) {
  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 256 }}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" minTickGap={24} tick={{ fontSize: 12 }} />
          <YAxis width={48} tick={{ fontSize: 12 }} tickFormatter={(value) => Number(value).toLocaleString("en-KE")} />
          <Tooltip formatter={(value) => [shillings(value), "Sales"]} />
          <Bar dataKey="revenue" name="Sales" fill="#1E1B4B" maxBarSize={28} isAnimationActive={false} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
