"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, ShoppingCart, ReceiptText, BarChart3 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CategoryPieChart, MonthlyRevenueChart } from "@/components/dashboard/charts"
import { Product, Sale } from "@/lib/types"
import { formatDate, formatINR } from "@/lib/format"

type Page = "dashboard" | "add-sale" | "products" | "sales" | "settings"

const categories = ["Plywood", "Doors", "Cen Mica", "Veneer", "Decoratives", "Hardware", "Other"]
const payments = ["Cash", "UPI", "Cheque", "Credit", "NEFT/RTGS"]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-slate-400">
      {children}
    </label>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
          </div>
          <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2">
            <Icon className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
      {children}
    </span>
  )
}

export default function HomePage() {
  const [page, setPage] = useState<Page>("dashboard")
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [salesRes, productsRes] = await Promise.all([fetch("/api/sales"), fetch("/api/products")])
      setSales(await salesRes.json())
      setProducts(await productsRes.json())
      setLoading(false)
    })()
  }, [])

  const totalRevenue = useMemo(() => sales.reduce((a, b) => a + Number(b.total_amount || 0), 0), [sales])
  const totalUnits = useMemo(() => sales.reduce((a, b) => a + Number(b.qty || 0), 0), [sales])
  const avgOrder = sales.length ? totalRevenue / sales.length : 0

  const monthly = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) {
      const k = new Date(s.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      m.set(k, (m.get(k) || 0) + Number(s.total_amount || 0))
    }
    return Array.from(m.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [sales])

  const categoryData = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) {
      m.set(s.category, (m.get(s.category) || 0) + Number(s.total_amount || 0))
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
  }, [sales])

  async function addSale(formData: FormData) {
    const productId = String(formData.get("product_id"))
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const qty = Number(formData.get("qty"))
    const unitPrice = Number(formData.get("unit_price"))
    const discount = Number(formData.get("discount_pct"))
    const total = qty * unitPrice * (1 - discount / 100)
    const payload: Sale = {
      sale_id: `S${1000 + sales.length}`,
      date: String(formData.get("date")),
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      qty,
      unit_price: unitPrice,
      discount_pct: discount,
      total_amount: Number(total.toFixed(2)),
      customer: String(formData.get("customer") || "Walk-in"),
      project: String(formData.get("project") || "General"),
      payment: String(formData.get("payment") || "Cash"),
      note: String(formData.get("note") || "")
    }
    await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSales((prev) => [...prev, payload])
    setPage("sales")
  }

  async function addProduct(formData: FormData) {
    const payload: Product = {
      id: String(formData.get("id")),
      name: String(formData.get("name")),
      category: String(formData.get("category")),
      size: String(formData.get("size")),
      thickness: String(formData.get("thickness")),
      unit: String(formData.get("unit")),
      base_price: Number(formData.get("base_price"))
    }
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setProducts((prev) => [...prev, payload])
    setPage("products")
  }

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar page={page} setPage={setPage} />

      <main className="ml-60 flex-1 min-w-0 px-8 py-8">
        <div className="mx-auto max-w-6xl animate-fade-in">

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
              Loading…
            </div>
          )}

          {/* DASHBOARD */}
          {!loading && page === "dashboard" && (
            <div className="space-y-5">
              <PageHeader title="Overview" description="Business performance at a glance" />

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={TrendingUp} />
                <StatCard label="Units Sold" value={totalUnits.toLocaleString("en-IN")} icon={ShoppingCart} />
                <StatCard label="Transactions" value={String(sales.length)} icon={ReceiptText} />
                <StatCard label="Avg Order" value={formatINR(avgOrder)} icon={BarChart3} />
              </div>

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
            </div>
          )}

          {/* SALES */}
          {!loading && page === "sales" && (
            <div className="space-y-5">
              <PageHeader title="Sales" description={`${sales.length} transactions`} />
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        {["Date", "Product", "Category", "Qty", "Amount"].map((h, i) => (
                          <th key={h} className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr key={s.sale_id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-3 text-slate-500">{formatDate(s.date)}</td>
                          <td className="px-5 py-3 font-medium text-slate-200">{s.product_name}</td>
                          <td className="px-5 py-3"><Badge>{s.category}</Badge></td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-300">{s.qty}</td>
                          <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-200">{formatINR(Number(s.total_amount))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* PRODUCTS */}
          {!loading && page === "products" && (
            <div className="space-y-5">
              <PageHeader title="Products" description={`${products.length} items in catalogue`} />
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        {["ID", "Name", "Category", "Size", "Base Price"].map((h, i) => (
                          <th key={h} className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                          <td className="px-5 py-3 font-medium text-slate-200">{p.name}</td>
                          <td className="px-5 py-3"><Badge>{p.category}</Badge></td>
                          <td className="px-5 py-3 text-slate-400">{p.size}</td>
                          <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-200">{formatINR(Number(p.base_price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ADD SALE */}
          {!loading && page === "add-sale" && (
            <div className="space-y-5">
              <PageHeader title="Add Sale" description="Record a new transaction" />
              <div className="max-w-xl">
                <Card>
                  <CardContent className="pt-6">
                    <form action={addSale} className="space-y-4">
                      <div className="col-span-2">
                        <Field label="Product">
                          <Select name="product_id" required>
                            <option value="">Select a product…</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </Select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date"><Input name="date" type="date" required /></Field>
                        <Field label="Payment">
                          <Select name="payment">{payments.map((p) => <option key={p}>{p}</option>)}</Select>
                        </Field>
                        <Field label="Quantity"><Input name="qty" type="number" min={1} defaultValue={1} required /></Field>
                        <Field label="Unit Price (₹)"><Input name="unit_price" type="number" min={0} step={1} required /></Field>
                        <Field label="Discount %"><Input name="discount_pct" type="number" min={0} max={50} step={0.5} defaultValue={0} /></Field>
                        <Field label="Customer"><Input name="customer" placeholder="Walk-in" /></Field>
                        <Field label="Project"><Input name="project" placeholder="General" /></Field>
                      </div>
                      <Field label="Note"><Input name="note" placeholder="Optional note" /></Field>
                      <Separator />
                      <Button type="submit" className="w-full">Save Sale</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {!loading && page === "settings" && (
            <div className="space-y-5">
              <PageHeader title="Settings" description="Manage products and view stats" />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 max-w-4xl">
                <Card>
                  <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
                  <CardContent>
                    <form action={addProduct} className="space-y-4">
                      <Field label="Product ID"><Input name="id" placeholder="e.g. P999" required /></Field>
                      <Field label="Name"><Input name="name" placeholder="Product name" required /></Field>
                      <Field label="Category">
                        <Select name="category" required>
                          {categories.map((c) => <option key={c}>{c}</option>)}
                        </Select>
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Size"><Input name="size" placeholder="e.g. 8×4 ft" required /></Field>
                        <Field label="Thickness"><Input name="thickness" placeholder="e.g. 18mm" required /></Field>
                        <Field label="Unit"><Input name="unit" placeholder="e.g. Sheet" required /></Field>
                        <Field label="Base Price (₹)"><Input name="base_price" type="number" min={0} required /></Field>
                      </div>
                      <Button type="submit" className="w-full">Add Product</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      {[
                        ["Total Products", String(products.length)],
                        ["Total Sales", String(sales.length)],
                        ["Total Revenue", formatINR(totalRevenue)],
                        ["Avg Order Value", formatINR(avgOrder)],
                        ["Total Units Sold", totalUnits.toLocaleString("en-IN")]
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <dt className="text-sm text-slate-500">{label}</dt>
                          <dd className="text-sm font-medium tabular-nums text-slate-200">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
