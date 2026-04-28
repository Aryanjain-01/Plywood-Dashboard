"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card } from "@/components/ui/card"
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
      const k = new Date(s.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
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

    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
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

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    setProducts((prev) => [...prev, payload])
    setPage("products")
  }

  return (
    <div className="min-h-screen">
      <Sidebar page={page} setPage={setPage} />
      <main className="ml-64 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <Card className="p-6">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Plywood Business Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">Modern TypeScript + shadcn UI frontend</p>
          </Card>

          {loading ? <Card className="p-6 text-slate-300">Loading...</Card> : null}

          {!loading && page === "dashboard" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-5"><p className="text-xs text-slate-400">Revenue</p><p className="mt-2 text-2xl font-semibold">{formatINR(totalRevenue)}</p></Card>
                <Card className="p-5"><p className="text-xs text-slate-400">Units Sold</p><p className="mt-2 text-2xl font-semibold">{totalUnits.toLocaleString("en-IN")}</p></Card>
                <Card className="p-5"><p className="text-xs text-slate-400">Transactions</p><p className="mt-2 text-2xl font-semibold">{sales.length}</p></Card>
                <Card className="p-5"><p className="text-xs text-slate-400">Avg Order</p><p className="mt-2 text-2xl font-semibold">{formatINR(avgOrder)}</p></Card>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="p-4"><p className="mb-2 text-sm text-slate-300">Monthly Revenue</p><MonthlyRevenueChart data={monthly} /></Card>
                <Card className="p-4"><p className="mb-2 text-sm text-slate-300">Category Mix</p><CategoryPieChart data={categoryData} /></Card>
              </div>
            </>
          )}

          {!loading && page === "sales" && (
            <Card className="overflow-hidden">
              <div className="p-4"><p className="text-lg font-semibold">All Sales</p></div>
              <Separator />
              <div className="max-h-[65vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-950/80 text-left text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Date</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => (
                      <tr key={s.sale_id} className="border-t border-white/10 text-slate-100">
                        <td className="px-4 py-3">{formatDate(s.date)}</td>
                        <td className="px-4 py-3">{s.product_name}</td>
                        <td className="px-4 py-3">{s.category}</td>
                        <td className="px-4 py-3">{s.qty}</td>
                        <td className="px-4 py-3">{formatINR(Number(s.total_amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {!loading && page === "products" && (
            <Card className="overflow-hidden">
              <div className="p-4"><p className="text-lg font-semibold">Products</p></div>
              <Separator />
              <div className="max-h-[65vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-950/80 text-left text-slate-300">
                    <tr>
                      <th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-white/10 text-slate-100">
                        <td className="px-4 py-3">{p.id}</td>
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.category}</td>
                        <td className="px-4 py-3">{formatINR(Number(p.base_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {!loading && page === "add-sale" && (
            <Card className="p-5">
              <p className="mb-4 text-lg font-semibold">Add Sale</p>
              <form action={addSale} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select name="product_id" required>
                  <option value="">Select Product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <Input name="date" type="date" required />
                <Input name="qty" type="number" min={1} defaultValue={1} required />
                <Input name="unit_price" type="number" min={0} step={1} required />
                <Input name="discount_pct" type="number" min={0} max={50} step={0.5} defaultValue={0} />
                <Select name="payment">{payments.map((p) => <option key={p}>{p}</option>)}</Select>
                <Input name="customer" placeholder="Customer" />
                <Input name="project" placeholder="Project" />
                <Input name="note" placeholder="Note" className="md:col-span-2" />
                <Button className="md:col-span-2" type="submit">Save Sale</Button>
              </form>
            </Card>
          )}

          {!loading && page === "settings" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card className="p-5">
                <p className="mb-4 text-lg font-semibold">Add Product</p>
                <form action={addProduct} className="space-y-3">
                  <Input name="id" placeholder="ID (e.g. P999)" required />
                  <Input name="name" placeholder="Product Name" required />
                  <Select name="category" required>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
                  <Input name="size" placeholder="Size" required />
                  <Input name="thickness" placeholder="Thickness" required />
                  <Input name="unit" placeholder="Unit" required />
                  <Input name="base_price" type="number" min={0} required />
                  <Button type="submit" className="w-full">Add Product</Button>
                </form>
              </Card>
              <Card className="p-5">
                <p className="mb-4 text-lg font-semibold">Stats</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>Total products: <span className="text-slate-100">{products.length}</span></p>
                  <p>Total sales records: <span className="text-slate-100">{sales.length}</span></p>
                  <p>Revenue: <span className="text-slate-100">{formatINR(totalRevenue)}</span></p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
