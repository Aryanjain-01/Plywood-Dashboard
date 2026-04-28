"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Line,
  ComposedChart
} from "recharts"

const colors = ["#3b82f6", "#6366f1", "#06b6d4", "#60a5fa", "#2563eb"]

export function MonthlyRevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data}>
        <CartesianGrid stroke="#1f2a3a" strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#c5d4ea" />
        <YAxis stroke="#c5d4ea" />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        <Line dataKey="revenue" stroke="#06b6d4" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={110}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
