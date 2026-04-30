"use client"

import { useMemo } from "react"
import { Users, TrendingUp, ShoppingCart, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  WeeklyTrendChart, PaymentBreakdownChart,
  MoMComparisonChart, MarginByProductChart
} from "@/components/dashboard/charts"
import { StatCard, PageHeader, Badge } from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR } from "@/lib/format"
import { categoryColors, customerTypeColors } from "@/lib/constants"

export function AnalyticsPage() {
  const { sales, products } = useApp()

  const totalRevenue = useMemo(() => sales.reduce((a, b) => a + Number(b.total_amount || 0), 0), [sales])
  const totalUnits = useMemo(() => sales.reduce((a, b) => a + Number(b.qty || 0), 0), [sales])

  const totalProfit = useMemo(() => {
    return sales.reduce((acc, s) => {
      const p = products.find((p) => p.id === s.product_id)
      if (!p || !p.cost_price) return acc
      return acc + (Number(s.total_amount) - p.cost_price * s.qty)
    }, 0)
  }, [sales, products])

  const overallMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const weeklyData = useMemo(() => {
    const weeks: { week: string; revenue: number; count: number }[] = []
    const now = new Date(); now.setHours(0, 0, 0, 0)
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now); start.setDate(start.getDate() - i * 7 - now.getDay())
      const end = new Date(start); end.setDate(end.getDate() + 7)
      const label = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      const bucket = sales.filter((s) => { const d = new Date(s.date).getTime(); return d >= start.getTime() && d < end.getTime() })
      weeks.push({ week: label, revenue: bucket.reduce((a, b) => a + Number(b.total_amount || 0), 0), count: bucket.length })
    }
    return weeks
  }, [sales])

  const momData = useMemo(() => {
    const result: { month: string; current: number; previous: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1)
      const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      const current = sales.filter((s) => s.date.startsWith(key)).reduce((a, b) => a + Number(b.total_amount || 0), 0)
      const previous = sales.filter((s) => s.date.startsWith(prevKey)).reduce((a, b) => a + Number(b.total_amount || 0), 0)
      result.push({ month: label, current, previous })
    }
    return result
  }, [sales])

  const marginData = useMemo(() => {
    const m = new Map<string, { name: string; revenue: number; cost: number }>()
    for (const s of sales) {
      const p = products.find((p) => p.id === s.product_id)
      if (!p || !p.cost_price) continue
      const cur = m.get(s.product_id) || { name: s.product_name, revenue: 0, cost: 0 }
      m.set(s.product_id, { name: s.product_name, revenue: cur.revenue + Number(s.total_amount), cost: cur.cost + p.cost_price * s.qty })
    }
    return Array.from(m.values())
      .map((d) => ({ name: d.name.split(" ").slice(0, 3).join(" "), margin: d.revenue > 0 ? ((d.revenue - d.cost) / d.revenue) * 100 : 0 }))
      .sort((a, b) => b.margin - a.margin).slice(0, 8)
  }, [sales, products])

  const paymentData = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) m.set(s.payment, (m.get(s.payment) || 0) + Number(s.total_amount || 0))
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [sales])

  const categoryData = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) m.set(s.category, (m.get(s.category) || 0) + Number(s.total_amount || 0))
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [sales])

  const topCustomers = useMemo(() => {
    const m = new Map<string, { revenue: number; count: number; type: string }>()
    for (const s of sales) {
      const cur = m.get(s.customer) || { revenue: 0, count: 0, type: s.customer_type || "Retail" }
      m.set(s.customer, { revenue: cur.revenue + Number(s.total_amount || 0), count: cur.count + 1, type: s.customer_type || cur.type })
    }
    return Array.from(m.entries()).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [sales])

  const customerTypeRevenue = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) m.set(s.customer_type || "Retail", (m.get(s.customer_type || "Retail") || 0) + Number(s.total_amount))
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [sales])

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader title="Analytics" description="Deeper business insights" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Gross Profit" value={formatINR(totalProfit)} icon={Percent} />
        <StatCard label="Avg Margin" value={`${overallMarginPct.toFixed(1)}%`} icon={TrendingUp} />
        <StatCard label="Unique Customers" value={String(topCustomers.length)} icon={Users} />
        <StatCard label="Units Sold" value={totalUnits.toLocaleString("en-IN")} icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Month-over-Month Revenue</CardTitle></CardHeader>
          <CardContent><MoMComparisonChart data={momData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Profit Margin by Product</CardTitle></CardHeader>
          <CardContent><MarginByProductChart data={marginData} /></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly Revenue Trend</CardTitle></CardHeader>
          <CardContent><WeeklyTrendChart data={weeklyData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment Method Breakdown</CardTitle></CardHeader>
          <CardContent><PaymentBreakdownChart data={paymentData} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />Top Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? <p className="text-sm text-slate-600">No customer data yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    {["#", "Customer", "Type", "Orders", "Total Revenue", "Avg Order"].map((h, i) => (
                      <th key={h} className={`py-2.5 text-xs font-medium text-slate-500 ${i > 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.name} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 text-xs text-slate-600">#{i + 1}</td>
                      <td className="py-2.5 font-medium text-slate-200">{c.name}</td>
                      <td className="py-2.5">
                        <Badge colorClass={customerTypeColors[c.type] ?? customerTypeColors.Other}>{c.type}</Badge>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">{c.count}</td>
                      <td className="py-2.5 text-right tabular-nums font-medium text-slate-200">{formatINR(c.revenue)}</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">{formatINR(c.revenue / c.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? <p className="text-sm text-slate-600">No data.</p> : (
              <div className="space-y-2.5">
                {categoryData.map(({ name, value }) => {
                  const pct = (value / totalRevenue) * 100
                  return (
                    <div key={name}>
                      <div className="mb-1 flex items-center justify-between">
                        <Badge colorClass={categoryColors[name]}>{name}</Badge>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                          <span className="w-24 text-right text-sm font-medium tabular-nums text-slate-300">{formatINR(value)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.05]">
                        <div className="h-1 rounded-full bg-indigo-500/50 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Customer Type Revenue Split</CardTitle></CardHeader>
          <CardContent>
            {customerTypeRevenue.length === 0 ? <p className="text-sm text-slate-600">No data.</p> : (
              <div className="space-y-2.5">
                {customerTypeRevenue.map(([type, value]) => {
                  const pct = (value / totalRevenue) * 100
                  return (
                    <div key={type}>
                      <div className="mb-1 flex items-center justify-between">
                        <Badge colorClass={customerTypeColors[type] ?? customerTypeColors.Other}>{type}</Badge>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                          <span className="w-24 text-right text-sm font-medium tabular-nums text-slate-300">{formatINR(value)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.05]">
                        <div className="h-1 rounded-full bg-cyan-500/50 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
