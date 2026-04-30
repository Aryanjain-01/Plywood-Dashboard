"use client"

import { useMemo } from "react"
import { TrendingUp, ReceiptText, BarChart3, AlertTriangle, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryPieChart, MonthlyRevenueChart } from "@/components/dashboard/charts"
import { StatCard, TargetProgress, PageHeader, Badge } from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR, formatDate } from "@/lib/format"
import { categoryColors } from "@/lib/constants"

export function DashboardPage() {
  const { sales, products, targets, setPage, setReceiptSale } = useApp()

  const totalRevenue = useMemo(() => sales.reduce((a, b) => a + Number(b.total_amount || 0), 0), [sales])

  const totalProfit = useMemo(() => {
    return sales.reduce((acc, s) => {
      const p = products.find((p) => p.id === s.product_id)
      if (!p || !p.cost_price) return acc
      return acc + (Number(s.total_amount) - p.cost_price * s.qty)
    }, 0)
  }, [sales, products])

  const overallMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const trends = useMemo(() => {
    const now = Date.now(); const day = 86400000
    const recent = sales.filter((s) => now - new Date(s.date).getTime() < 30 * day)
    const prior = sales.filter((s) => { const a = now - new Date(s.date).getTime(); return a >= 30 * day && a < 60 * day })
    const rRev = recent.reduce((a, b) => a + Number(b.total_amount || 0), 0)
    const pRev = prior.reduce((a, b) => a + Number(b.total_amount || 0), 0)
    const rUnits = recent.reduce((a, b) => a + Number(b.qty || 0), 0)
    const pUnits = prior.reduce((a, b) => a + Number(b.qty || 0), 0)
    return {
      revTrend: pRev ? ((rRev - pRev) / pRev) * 100 : undefined,
      unitsTrend: pUnits ? ((rUnits - pUnits) / pUnits) * 100 : undefined,
      txTrend: prior.length ? ((recent.length - prior.length) / prior.length) * 100 : undefined,
    }
  }, [sales])

  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisMonthRevenue = useMemo(() =>
    sales.filter((s) => s.date.startsWith(thisMonth)).reduce((a, b) => a + Number(b.total_amount || 0), 0),
    [sales, thisMonth])
  const thisMonthTarget = targets.find((t) => t.month === thisMonth)

  const monthly = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) {
      const d = new Date(s.date); if (isNaN(d.getTime())) continue
      const k = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      m.set(k, (m.get(k) || 0) + Number(s.total_amount || 0))
    }
    return Array.from(m.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [sales])

  const categoryData = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) m.set(s.category, (m.get(s.category) || 0) + Number(s.total_amount || 0))
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [sales])

  const topProducts = useMemo(() => {
    const m = new Map<string, { name: string; revenue: number; qty: number }>()
    for (const s of sales) {
      const cur = m.get(s.product_id) || { name: s.product_name, revenue: 0, qty: 0 }
      m.set(s.product_id, { name: s.product_name, revenue: cur.revenue + Number(s.total_amount || 0), qty: cur.qty + Number(s.qty || 0) })
    }
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [sales])

  const recentActivity = useMemo(() =>
    [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [sales])

  const lowStockProducts = useMemo(() =>
    products.filter((p) => p.stock <= p.reorder_level).sort((a, b) => (a.stock / a.reorder_level) - (b.stock / b.reorder_level)),
    [products])

  const avgOrder = sales.length ? totalRevenue / sales.length : 0

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader title="Overview" description="Business performance at a glance" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={TrendingUp} trend={trends.revTrend} trendLabel="vs last 30d" onClick={() => setPage("analytics")} />
        <StatCard label="Gross Profit" value={formatINR(totalProfit)} icon={Percent} sub={`${overallMarginPct.toFixed(1)}% margin`} onClick={() => setPage("analytics")} />
        <StatCard label="Transactions" value={String(sales.length)} icon={ReceiptText} trend={trends.txTrend} trendLabel="vs last 30d" onClick={() => setPage("sales")} />
        <StatCard label="Avg Order" value={formatINR(avgOrder)} icon={BarChart3} trend={trends.unitsTrend} trendLabel="units 30d" />
      </div>

      {thisMonthTarget && (
        <TargetProgress
          actual={thisMonthRevenue}
          target={thisMonthTarget.target}
          month={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        />
      )}

      {lowStockProducts.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/[0.03]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alert — {lowStockProducts.length} item{lowStockProducts.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p) => (
                <button key={p.id} onClick={() => setPage("products")}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs transition-all duration-150 hover:bg-amber-500/20 hover:scale-105">
                  <span className="font-medium text-amber-300">{p.name}</span>
                  <span className="text-amber-600">{p.stock === 0 ? "Out" : `${p.stock} left`}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent><MonthlyRevenueChart data={monthly} /></CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Category Mix</CardTitle></CardHeader>
          <CardContent><CategoryPieChart data={categoryData} /></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {topProducts.length > 0 && (
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const pct = (p.revenue / totalRevenue) * 100
                  return (
                    <div key={p.name} className="animate-in fade-in slide-in-from-left-1 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-xs text-slate-600">#{i + 1}</span>
                          <span className="text-sm text-slate-300">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500">{p.qty} units</span>
                          <span className="w-24 text-right text-sm font-medium tabular-nums text-slate-200">{formatINR(p.revenue)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.05]">
                        <div className="h-1 rounded-full bg-indigo-500/60 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="divide-y divide-white/[0.04]">
                {recentActivity.map((s) => (
                  <button key={s.sale_id} onClick={() => setReceiptSale(s)}
                    className="flex w-full items-start gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/[0.02]">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-400">
                      {s.category[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-300">{s.product_name}</p>
                      <p className="text-[10px] text-slate-600">{s.customer} · {formatDate(s.date)}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">{formatINR(Number(s.total_amount))}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
