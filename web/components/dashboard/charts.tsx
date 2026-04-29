"use client"

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, CartesianGrid, ReferenceLine,
  AreaChart, Area, LineChart, Line
} from "recharts"

const COLORS = ["#6366f1", "#22d3ee", "#34d399", "#a78bfa", "#f472b6", "#fb923c", "#818cf8"]

const tooltipStyle = {
  background: "#1a2030", border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "10px", fontSize: "12px", color: "#e2e8f0",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)", padding: "10px 14px"
}
const tooltipLabelStyle = { color: "#64748b", marginBottom: 4 }
const tooltipItemStyle = { color: "#e2e8f0" }
const axisStyle = { fontSize: 11, fill: "#475569" }

function EmptyChart() {
  return <div className="flex h-[240px] items-center justify-center text-sm text-slate-600">No data yet</div>
}

// ── Monthly Revenue Bar ──────────────────────────────────────────────────────

export function MonthlyRevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length === 0) return <EmptyChart />
  const avg = data.reduce((a, b) => a + b.revenue, 0) / data.length
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
        <ReferenceLine y={avg} stroke="rgba(99,102,241,0.35)" strokeDasharray="4 3"
          label={{ value: "avg", position: "right", fontSize: 10, fill: "#6366f1" }} />
        <Bar dataKey="revenue" fill="url(#barGrad)" radius={[5, 5, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Category Pie ─────────────────────────────────────────────────────────────

interface LabelProps { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string; value: number }

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) {
  if (percent < 0.07) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <defs>{COLORS.map((c, i) => (
          <radialGradient key={i} id={`pg${i}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={c} stopOpacity={1} /><stop offset="100%" stopColor={c} stopOpacity={0.7} />
          </radialGradient>
        ))}</defs>
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          formatter={(v: number, name: string) => [`₹${v.toLocaleString("en-IN")}`, name]} />
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
          innerRadius={60} outerRadius={90} paddingAngle={3} labelLine={false} label={PieLabel} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={`url(#pg${i % COLORS.length})`} />)}
        </Pie>
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(v: string) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Weekly Trend Area ────────────────────────────────────────────────────────

export function WeeklyTrendChart({ data }: { data: { week: string; revenue: number; count: number }[] }) {
  if (data.every((d) => d.revenue === 0)) return <EmptyChart />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="week" tick={axisStyle} axisLine={false} tickLine={false} dy={6} interval={Math.floor(data.length / 5)} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          cursor={{ stroke: "rgba(255,255,255,0.06)" }}
          formatter={(v: number, name: string) => [name === "revenue" ? `₹${v.toLocaleString("en-IN")}` : v, name === "revenue" ? "Revenue" : "Orders"]} />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
          fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Payment Breakdown Horizontal Bar ─────────────────────────────────────────

const PAY_COLORS: Record<string, string> = { Cash: "#34d399", UPI: "#60a5fa", Cheque: "#fbbf24", Credit: "#f87171", "NEFT/RTGS": "#c084fc" }

export function PaymentBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={72} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={28}>
          {data.map((d, i) => <Cell key={i} fill={PAY_COLORS[d.name] ?? COLORS[i % COLORS.length]} fillOpacity={0.8} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Month-over-Month Grouped Bar ──────────────────────────────────────────────

export function MoMComparisonChart({ data }: { data: { month: string; current: number; previous: number }[] }) {
  if (data.every((d) => d.current === 0 && d.previous === 0)) return <EmptyChart />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -4, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          formatter={(v: number, name: string) => [`₹${v.toLocaleString("en-IN")}`, name === "current" ? "This Month" : "Prev Month"]} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(v: string) => <span style={{ color: "#94a3b8" }}>{v === "current" ? "This Month" : "Prev Month"}</span>} />
        <Bar dataKey="previous" fill="#334155" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="current" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Margin by Product Horizontal Bar ─────────────────────────────────────────

export function MarginByProductChart({ data }: { data: { name: string; margin: number }[] }) {
  if (data.length === 0) return <EmptyChart />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} domain={[0, 50]} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={100} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle}
          formatter={(v: number) => [`${v.toFixed(1)}%`, "Gross Margin"]} />
        <Bar dataKey="margin" radius={[0, 5, 5, 0]} maxBarSize={20}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.margin >= 25 ? "#34d399" : d.margin >= 15 ? "#fbbf24" : "#f87171"} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
