"use client"

import { useState } from "react"
import { Target, Activity, Download, Check, X, Pencil, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PageHeader, Field } from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR } from "@/lib/format"
import { categories } from "@/lib/constants"
import type { Product, Sale } from "@/lib/types"

export function SettingsPage() {
  const { sales, products, setProducts, targets, setTargets, setPage, submitLoading, setSubmitLoading, showToast } = useApp()

  const totalRevenue = sales.reduce((a, b) => a + Number(b.total_amount || 0), 0)
  const totalProfit = sales.reduce((acc, s) => {
    const p = products.find((p) => p.id === s.product_id)
    if (!p || !p.cost_price) return acc
    return acc + (Number(s.total_amount) - p.cost_price * s.qty)
  }, 0)
  const overallMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  const lowStockProducts = products.filter((p) => p.stock <= p.reorder_level)

  const [editingTarget, setEditingTarget] = useState<string | null>(null)
  const [editingTargetValue, setEditingTargetValue] = useState("")

  async function addProduct(formData: FormData) {
    const payload: Product = {
      id: String(formData.get("id")), name: String(formData.get("name")),
      category: String(formData.get("category")), size: String(formData.get("size")),
      thickness: String(formData.get("thickness")), unit: String(formData.get("unit")),
      base_price: Number(formData.get("base_price")), cost_price: Number(formData.get("cost_price")),
      stock: Number(formData.get("stock")), reorder_level: Number(formData.get("reorder_level"))
    }
    if (products.find((p) => p.id === payload.id)) { showToast("Product ID already exists", "err"); return }
    setSubmitLoading(true)
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setProducts((prev) => [...prev, payload])
    setSubmitLoading(false); showToast("Product added"); setPage("products")
  }

  async function saveTarget(month: string, value: number) {
    await fetch("/api/targets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, target: value }) })
    setTargets((prev) => {
      const idx = prev.findIndex((t) => t.month === month)
      if (idx >= 0) { const n = [...prev]; n[idx] = { month, target: value }; return n }
      return [...prev, { month, target: value }]
    })
    setEditingTarget(null); showToast("Target saved")
  }

  function exportCSV(rows: Sale[]) {
    const headers = ["Sale ID", "Date", "Product", "Category", "Qty", "Unit Price", "Discount %", "Total", "Customer", "Customer Type", "Project", "Payment", "Note"]
    const lines = [headers.join(","), ...rows.map((s) =>
      [s.sale_id, s.date, `"${s.product_name}"`, s.category, s.qty, s.unit_price, s.discount_pct, s.total_amount, `"${s.customer}"`, s.customer_type || "", `"${s.project}"`, s.payment, `"${s.note}"`].join(",")
    )]
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `sales_${new Date().toISOString().split("T")[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader title="Settings" description="Manage products, targets, and data" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-slate-500" />Add Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Product ID"><Input name="id" placeholder="e.g. P999" required /></Field>
                <Field label="Name"><Input name="name" placeholder="Product name" required /></Field>
              </div>
              <Field label="Category">
                <Select name="category" required>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Size"><Input name="size" placeholder="e.g. 8×4 ft" required /></Field>
                <Field label="Thickness"><Input name="thickness" placeholder="e.g. 18mm" required /></Field>
                <Field label="Unit"><Input name="unit" placeholder="e.g. Sheet" required /></Field>
                <Field label="Selling Price (₹)"><Input name="base_price" type="number" min={0} required /></Field>
                <Field label="Cost Price (₹)"><Input name="cost_price" type="number" min={0} required /></Field>
                <Field label="Opening Stock"><Input name="stock" type="number" min={0} defaultValue={0} required /></Field>
                <Field label="Reorder Level"><Input name="reorder_level" type="number" min={0} defaultValue={10} required /></Field>
              </div>
              <Button type="submit" className="w-full" disabled={submitLoading}>
                {submitLoading ? "Adding…" : "Add Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />Monthly Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-slate-600">Set revenue targets for each month. Click a value to edit.</p>
              <div className="space-y-2">
                {Array.from({ length: 6 }, (_, i) => {
                  const d = new Date(); d.setMonth(d.getMonth() - 2 + i)
                  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
                  const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                  const existing = targets.find((t) => t.month === month)
                  const actual = sales.filter((s) => s.date.startsWith(month)).reduce((a, b) => a + Number(b.total_amount || 0), 0)
                  const isEditing = editingTarget === month
                  return (
                    <div key={month} className="flex items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2 transition-colors hover:border-white/[0.10]">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-300">{label}</p>
                        <p className="text-[10px] text-slate-600">Actual: {formatINR(actual)}</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input type="number" min={0} value={editingTargetValue}
                            onChange={(e) => setEditingTargetValue(e.target.value)} autoFocus
                            className="h-7 w-28 rounded border border-indigo-500/40 bg-white/[0.06] px-2 text-right text-xs text-slate-200 focus:outline-none" />
                          <button onClick={() => saveTarget(month, Number(editingTargetValue))}
                            className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                            <Check className="h-3 w-3" />
                          </button>
                          <button onClick={() => setEditingTarget(null)}
                            className="flex h-7 w-7 items-center justify-center rounded bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingTarget(month); setEditingTargetValue(String(existing?.target || "")) }}
                          className="group flex items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-colors">
                          {existing ? formatINR(existing.target) : <span className="text-slate-600">Set target…</span>}
                          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500" />Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <dl className="space-y-2">
                {[
                  ["Total Products", String(products.length)],
                  ["Total Sales", String(sales.length)],
                  ["Total Revenue", formatINR(totalRevenue)],
                  ["Gross Profit", formatINR(totalProfit)],
                  ["Avg Margin", `${overallMarginPct.toFixed(1)}%`],
                  ["Low Stock Items", String(lowStockProducts.length)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="text-sm font-medium tabular-nums text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
              <Separator />
              <Button variant="outline" className="w-full gap-1.5 text-xs" onClick={() => exportCSV(sales)}>
                <Download className="h-3.5 w-3.5" /> Export All Sales (CSV)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
