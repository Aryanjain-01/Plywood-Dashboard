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
  CartesianGrid
} from "recharts"

const COLORS = [
  "oklch(0.60 0.18 264)",
  "oklch(0.65 0.16 220)",
  "oklch(0.68 0.14 185)",
  "oklch(0.70 0.13 160)",
  "oklch(0.62 0.17 295)"
]

const tooltipStyle = {
  background: "oklch(0.10 0.012 265)",
  border: "1px solid oklch(1 0 0 / 8%)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "oklch(0.94 0.005 265)"
}

const axisStyle = { fontSize: 11, fill: "oklch(0.55 0.02 265)" }

export function MonthlyRevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="oklch(1 0 0 / 5%)"
          strokeDasharray="0"
        />
        <XAxis
          dataKey="month"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "oklch(1 0 0 / 4%)" }}
          formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Bar
          dataKey="revenue"
          fill="oklch(0.60 0.18 264)"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  name: string
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: LabelProps) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="oklch(0.94 0.005 265)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={500}
    >
      {name.split(" ")[0]}
    </text>
  )
}

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={72}
          outerRadius={108}
          paddingAngle={2}
          labelLine={false}
          label={PieLabel}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
