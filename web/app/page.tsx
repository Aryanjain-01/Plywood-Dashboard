"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  TrendingUp, TrendingDown, ShoppingCart, ReceiptText, BarChart3,
  Search, X, ChevronDown, ChevronUp, ChevronsUpDown, Download, Plus,
  Pencil, Trash2, Check, Activity, Users, Printer, ChevronLeft, ChevronRight,
  Calendar, AlertTriangle, Target, Package, Percent
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  CategoryPieChart, MonthlyRevenueChart, WeeklyTrendChart,
  PaymentBreakdownChart, MoMComparisonChart, MarginByProductChart
} from "@/components/dashboard/charts"
import { Product, Sale, SalesTarget } from "@/lib/types"
import { formatDate, formatINR } from "@/lib/format"

type Page = "dashboard" | "add-sale" | "products" | "sales" | "analytics" | "settings"
type SortDir = "asc" | "desc" | null

const categories = ["Plywood", "Doors", "Cen Mica", "Veneer", "Decoratives", "Hardware", "Other"]
const payments = ["Cash", "UPI", "Cheque", "Credit", "NEFT/RTGS"]
const customerTypes = ["Retail", "Contractor", "Builder", "Dealer", "Other"]
const PAGE_SIZE = 15

const categoryColors: Record<string, string> = {
  Plywood: "bg-indigo-500/15 text-indigo-300",
  Doors: "bg-cyan-500/15 text-cyan-300",
  "Cen Mica": "bg-emerald-500/15 text-emerald-300",
  Veneer: "bg-violet-500/15 text-violet-300",
  Decoratives: "bg-pink-500/15 text-pink-300",
  Hardware: "bg-amber-500/15 text-amber-300",
  Other: "bg-slate-500/15 text-slate-300",
}
const paymentColors: Record<string, string> = {
  Cash: "bg-emerald-500/15 text-emerald-300",
  UPI: "bg-blue-500/15 text-blue-300",
  Cheque: "bg-amber-500/15 text-amber-300",
  Credit: "bg-red-500/15 text-red-300",
  "NEFT/RTGS": "bg-purple-500/15 text-purple-300",
}
const customerTypeColors: Record<string, string> = {
  Retail: "bg-sky-500/15 text-sky-300",
  Contractor: "bg-orange-500/15 text-orange-300",
  Builder: "bg-teal-500/15 text-teal-300",
  Dealer: "bg-fuchsia-500/15 text-fuchsia-300",
  Other: "bg-slate-500/15 text-slate-300",
}

// ── tiny shared components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-slate-400">{children}</label>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>
}
function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
function Badge({ children, colorClass }: { children: React.ReactNode; colorClass?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colorClass ?? "bg-indigo-500/10 text-indigo-400"}`}>
      {children}
    </span>
  )
}
function EmptyState({ icon: Icon = ReceiptText, message }: { icon?: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}
function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: string | null; sortDir: SortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-slate-600" />
  return sortDir === "asc" ? <ChevronUp className="ml-1 inline h-3 w-3 text-indigo-400" /> : <ChevronDown className="ml-1 inline h-3 w-3 text-indigo-400" />
}
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.04] pl-8 pr-8 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
      {value && <button onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"><X className="h-3.5 w-3.5" /></button>}
    </div>
  )
}
function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
      <span className="text-xs text-slate-600">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:pointer-events-none disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const n = pages <= 7 ? i + 1 : i < 3 ? i + 1 : i === 3 ? page : i === 4 ? Math.min(page + 1, pages - 1) : i === 5 ? -1 : pages
          if (n === -1) return <span key="e" className="px-1 text-xs text-slate-600">…</span>
          return (
            <button key={n} onClick={() => onChange(n)}
              className={`flex h-7 min-w-[28px] items-center justify-center rounded-md px-1 text-xs font-medium transition-colors ${n === page ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"}`}>
              {n}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:pointer-events-none disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── stock badge ───────────────────────────────────────────────────────────────

function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  if (stock === 0) return <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400"><AlertTriangle className="h-3 w-3" />Out</span>
  if (stock <= reorder) return <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400"><AlertTriangle className="h-3 w-3" />Low</span>
  return <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">{stock}</span>
}

// ── sale total preview ────────────────────────────────────────────────────────

function SaleTotalPreview({ qty, unitPrice, discount }: { qty: number; unitPrice: number; discount: number }) {
  if (!unitPrice || !qty) return null
  const total = qty * unitPrice * (1 - discount / 100)
  return (
    <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Estimated Total</span>
        <span className="text-base font-semibold text-indigo-300">{formatINR(total)}</span>
      </div>
      {discount > 0 && (
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-xs text-slate-600">After {discount}% discount</span>
          <span className="text-xs text-slate-500 line-through">{formatINR(qty * unitPrice)}</span>
        </div>
      )}
    </div>
  )
}

// ── monthly target progress ───────────────────────────────────────────────────

function TargetProgress({ actual, target, month }: { actual: number; target: number; month: string }) {
  const pct = Math.min((actual / target) * 100, 100)
  const over = actual > target
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">{month} Target</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{formatINR(actual)}</span>
          <span className="text-xs text-slate-600">/</span>
          <span className="text-xs font-medium text-slate-300">{formatINR(target)}</span>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
        <div className={`h-1.5 rounded-full transition-all ${over ? "bg-emerald-500" : pct > 70 ? "bg-indigo-500" : pct > 40 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={`text-[10px] font-medium ${over ? "text-emerald-400" : "text-slate-600"}`}>
          {over ? `+${formatINR(actual - target)} over target` : `${formatINR(target - actual)} remaining`}
        </span>
        <span className="text-[10px] text-slate-600">{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}

// ── receipt modal ─────────────────────────────────────────────────────────────

function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  function handlePrint() {
    const content = ref.current?.innerHTML
    if (!content) return
    const w = window.open("", "_blank", "width=480,height=700")
    if (!w) return
    w.document.write(`<html><head><title>Receipt ${sale.sale_id}</title><style>body{font-family:monospace;font-size:13px;color:#111;padding:24px;max-width:360px;margin:auto}h2{text-align:center;margin:0 0 4px;font-size:16px}.sub{text-align:center;color:#666;margin-bottom:16px;font-size:11px}.row{display:flex;justify-content:space-between;margin:6px 0}.divider{border-top:1px dashed #ccc;margin:10px 0}.total{font-weight:bold;font-size:15px}.footer{text-align:center;margin-top:16px;color:#888;font-size:11px}</style></head><body>${content}</body></html>`)
    w.document.close(); w.print()
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-white/[0.10] bg-[#161b24] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <p className="text-sm font-semibold text-slate-100">Receipt — {sale.sale_id}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-7 gap-1.5 text-xs" onClick={handlePrint}><Printer className="h-3 w-3" /> Print</Button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div ref={ref} className="px-5 py-4 font-mono text-xs text-slate-300">
          <h2 className="mb-1 text-center text-sm font-bold text-slate-100">PlywoodPro</h2>
          <p className="mb-4 text-center text-slate-500">{formatDate(sale.date)}</p>
          <div className="space-y-1.5">
            {[["Receipt No", sale.sale_id], ["Customer", sale.customer], ["Type", sale.customer_type || "—"], ["Payment", sale.payment], ...(sale.project !== "General" ? [["Project", sale.project]] : [])].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span>{v}</span></div>
            ))}
          </div>
          <div className="my-3 border-t border-dashed border-white/[0.10]" />
          <div className="space-y-1">
            <p className="text-slate-300">{sale.product_name}</p>
            <div className="flex justify-between text-slate-500"><span>{sale.qty} × {formatINR(sale.unit_price)}</span><span>{formatINR(sale.qty * sale.unit_price)}</span></div>
            {sale.discount_pct > 0 && <div className="flex justify-between text-emerald-400"><span>Discount ({sale.discount_pct}%)</span><span>−{formatINR(sale.qty * sale.unit_price * sale.discount_pct / 100)}</span></div>}
          </div>
          <div className="my-3 border-t border-dashed border-white/[0.10]" />
          <div className="flex justify-between text-sm font-semibold text-slate-100"><span>Total</span><span>{formatINR(sale.total_amount)}</span></div>
          {sale.note && <p className="mt-3 text-xs text-slate-600">Note: {sale.note}</p>}
          <p className="mt-4 text-center text-slate-600">Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}

// ── confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-xs rounded-xl border border-white/[0.10] bg-[#161b24] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-slate-300">{message}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 text-xs" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-red-500/90 text-xs hover:bg-red-500" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  )
}

// ── inline sale edit row ──────────────────────────────────────────────────────

function EditSaleRow({ sale, onSave, onCancel }: { sale: Sale; onSave: (s: Sale) => void; onCancel: () => void }) {
  const [qty, setQty] = useState(sale.qty)
  const [unitPrice, setUnitPrice] = useState(sale.unit_price)
  const [discount, setDiscount] = useState(sale.discount_pct)
  const [customer, setCustomer] = useState(sale.customer)
  const [customerType, setCustomerType] = useState(sale.customer_type || "Retail")
  const [payment, setPayment] = useState(sale.payment)
  function save() {
    const total = qty * unitPrice * (1 - discount / 100)
    onSave({ ...sale, qty, unit_price: unitPrice, discount_pct: discount, total_amount: Number(total.toFixed(2)), customer, customer_type: customerType, payment })
  }
  return (
    <tr className="border-b border-indigo-500/20 bg-indigo-500/[0.04]">
      <td className="px-5 py-2 text-xs text-slate-500">{formatDate(sale.date)}</td>
      <td className="px-5 py-2">
        <p className="text-xs font-medium text-slate-300">{sale.product_name}</p>
        <input value={customer} onChange={(e) => setCustomer(e.target.value)}
          className="mt-1 h-6 w-full rounded border border-white/10 bg-white/[0.06] px-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50" />
      </td>
      <td className="px-5 py-2">
        <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}
          className="h-6 w-full rounded border border-white/10 bg-[#1a1f28] px-1.5 text-xs text-slate-300 focus:outline-none">
          {customerTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-5 py-2">
        <select value={payment} onChange={(e) => setPayment(e.target.value)}
          className="h-6 w-full rounded border border-white/10 bg-[#1a1f28] px-1.5 text-xs text-slate-300 focus:outline-none">
          {payments.map((p) => <option key={p}>{p}</option>)}
        </select>
      </td>
      <td className="px-5 py-2 text-right">
        <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))}
          className="h-6 w-14 rounded border border-white/10 bg-white/[0.06] px-2 text-right text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50" />
      </td>
      <td className="px-5 py-2 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="h-6 w-20 rounded border border-white/10 bg-white/[0.06] px-2 text-right text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50" />
          <input type="number" min={0} max={50} step={0.5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
            className="h-5 w-16 rounded border border-white/10 bg-white/[0.06] px-2 text-right text-[10px] text-slate-500 focus:outline-none" />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button onClick={save} className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"><Check className="h-3 w-3" /></button>
          <button onClick={onCancel} className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.05] text-slate-500 hover:text-slate-300"><X className="h-3 w-3" /></button>
        </div>
      </td>
    </tr>
  )
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, trend, trendLabel, sub, onClick }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>
  trend?: number; trendLabel?: string; sub?: string; onClick?: () => void
}) {
  const up = trend !== undefined && trend >= 0
  return (
    <Card className={onClick ? "cursor-pointer transition-all hover:border-indigo-500/30 hover:bg-white/[0.02]" : ""} onClick={onClick}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
            {trend !== undefined && (
              <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{up ? "+" : ""}{trend.toFixed(1)}%</span>
                {trendLabel && <span className="font-normal text-slate-600">{trendLabel}</span>}
              </div>
            )}
          </div>
          <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2">
            <Icon className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [page, setPage] = useState<Page>("dashboard")
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)

  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: "sale"; id: string } | { type: "product"; id: string } | null>(null)
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

  // add-sale form
  const [saleProductId, setSaleProductId] = useState("")
  const [saleQty, setSaleQty] = useState(1)
  const [saleUnitPrice, setSaleUnitPrice] = useState(0)
  const [saleDiscount, setSaleDiscount] = useState(0)

  // sales table filters
  const [salesSearch, setSalesSearch] = useState("")
  const [salesCatFilter, setSalesCatFilter] = useState("")
  const [salesPayFilter, setSalesPayFilter] = useState("")
  const [salesTypeFilter, setSalesTypeFilter] = useState("")
  const [salesDateFrom, setSalesDateFrom] = useState("")
  const [salesDateTo, setSalesDateTo] = useState("")
  const [salesSortCol, setSalesSortCol] = useState<string | null>("date")
  const [salesSortDir, setSalesSortDir] = useState<SortDir>("desc")
  const [salesPage, setSalesPage] = useState(1)

  // products table filters
  const [productsSearch, setProductsSearch] = useState("")
  const [productsCatFilter, setProductsCatFilter] = useState("")
  const [productsSortCol, setProductsSortCol] = useState<string | null>(null)
  const [productsSortDir, setProductsSortDir] = useState<SortDir>(null)

  // settings: target editing
  const [editingTarget, setEditingTarget] = useState<string | null>(null)
  const [editingTargetValue, setEditingTargetValue] = useState("")

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }, [])

  // keyboard shortcut N → add sale
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "n" || e.key === "N") setPage("add-sale")
    }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [sr, pr, tr] = await Promise.all([fetch("/api/sales"), fetch("/api/products"), fetch("/api/targets")])
      setSales(await sr.json()); setProducts(await pr.json()); setTargets(await tr.json())
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const p = products.find((p) => p.id === saleProductId)
    if (p) setSaleUnitPrice(p.base_price)
  }, [saleProductId, products])

  useEffect(() => { setSalesPage(1) }, [salesSearch, salesCatFilter, salesPayFilter, salesTypeFilter, salesDateFrom, salesDateTo, salesSortCol, salesSortDir])

  // ── derived data ──────────────────────────────────────────────────────────

  const totalRevenue = useMemo(() => sales.reduce((a, b) => a + Number(b.total_amount || 0), 0), [sales])
  const totalUnits = useMemo(() => sales.reduce((a, b) => a + Number(b.qty || 0), 0), [sales])
  const avgOrder = sales.length ? totalRevenue / sales.length : 0

  const totalProfit = useMemo(() => {
    return sales.reduce((acc, s) => {
      const p = products.find((p) => p.id === s.product_id)
      if (!p || !p.cost_price) return acc
      const cost = p.cost_price * s.qty
      return acc + (Number(s.total_amount) - cost)
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

  // current month revenue for target progress
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

  const paymentData = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sales) m.set(s.payment, (m.get(s.payment) || 0) + Number(s.total_amount || 0))
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [sales])

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

  // MoM comparison: last 6 months
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

  // margin by product (top 8)
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

  const topCustomers = useMemo(() => {
    const m = new Map<string, { revenue: number; count: number; type: string }>()
    for (const s of sales) {
      const cur = m.get(s.customer) || { revenue: 0, count: 0, type: s.customer_type || "Retail" }
      m.set(s.customer, { revenue: cur.revenue + Number(s.total_amount || 0), count: cur.count + 1, type: s.customer_type || cur.type })
    }
    return Array.from(m.entries()).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [sales])

  // product sales counts for products table
  const productSalesCounts = useMemo(() => {
    const m = new Map<string, { qty: number; revenue: number }>()
    for (const s of sales) {
      const cur = m.get(s.product_id) || { qty: 0, revenue: 0 }
      m.set(s.product_id, { qty: cur.qty + s.qty, revenue: cur.revenue + Number(s.total_amount) })
    }
    return m
  }, [sales])

  // filtered + sorted sales
  const filteredSales = useMemo(() => {
    let result = sales.filter((s) => {
      const q = salesSearch.toLowerCase()
      if (q && !s.product_name.toLowerCase().includes(q) && !s.customer.toLowerCase().includes(q) && !s.sale_id.toLowerCase().includes(q) && !s.project.toLowerCase().includes(q)) return false
      if (salesCatFilter && s.category !== salesCatFilter) return false
      if (salesPayFilter && s.payment !== salesPayFilter) return false
      if (salesTypeFilter && s.customer_type !== salesTypeFilter) return false
      if (salesDateFrom && s.date < salesDateFrom) return false
      if (salesDateTo && s.date > salesDateTo) return false
      return true
    })
    if (salesSortCol) {
      result = [...result].sort((a, b) => {
        let av: string | number = "", bv: string | number = ""
        if (salesSortCol === "date") { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime() }
        else if (salesSortCol === "amount") { av = Number(a.total_amount); bv = Number(b.total_amount) }
        else if (salesSortCol === "qty") { av = Number(a.qty); bv = Number(b.qty) }
        else if (salesSortCol === "product") { av = a.product_name.toLowerCase(); bv = b.product_name.toLowerCase() }
        if (av < bv) return salesSortDir === "asc" ? -1 : 1
        if (av > bv) return salesSortDir === "asc" ? 1 : -1
        return 0
      })
    }
    return result
  }, [sales, salesSearch, salesCatFilter, salesPayFilter, salesTypeFilter, salesDateFrom, salesDateTo, salesSortCol, salesSortDir])

  const pagedSales = useMemo(() => {
    const start = (salesPage - 1) * PAGE_SIZE
    return filteredSales.slice(start, start + PAGE_SIZE)
  }, [filteredSales, salesPage])

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const q = productsSearch.toLowerCase()
      if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false
      if (productsCatFilter && p.category !== productsCatFilter) return false
      return true
    })
    if (productsSortCol) {
      result = [...result].sort((a, b) => {
        let av: string | number = "", bv: string | number = ""
        if (productsSortCol === "name") { av = a.name.toLowerCase(); bv = b.name.toLowerCase() }
        else if (productsSortCol === "price") { av = Number(a.base_price); bv = Number(b.base_price) }
        else if (productsSortCol === "stock") { av = Number(a.stock); bv = Number(b.stock) }
        if (av < bv) return productsSortDir === "asc" ? -1 : 1
        if (av > bv) return productsSortDir === "asc" ? 1 : -1
        return 0
      })
    }
    return result
  }, [products, productsSearch, productsCatFilter, productsSortCol, productsSortDir])

  function toggleSort(col: string, cur: string | null, dir: SortDir, setCol: (c: string | null) => void, setDir: (d: SortDir) => void) {
    if (cur !== col) { setCol(col); setDir("asc") }
    else if (dir === "asc") setDir("desc")
    else { setCol(null); setDir(null) }
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

  async function addSale(formData: FormData) {
    const productId = String(formData.get("product_id"))
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const qty = Number(formData.get("qty"))
    const unitPrice = Number(formData.get("unit_price"))
    const discount = Number(formData.get("discount_pct"))
    const total = qty * unitPrice * (1 - discount / 100)
    const payload: Sale = {
      sale_id: `S${Date.now()}`,
      date: String(formData.get("date")),
      product_id: product.id, product_name: product.name, category: product.category,
      qty, unit_price: unitPrice, discount_pct: discount, total_amount: Number(total.toFixed(2)),
      customer: String(formData.get("customer") || "Walk-in"),
      customer_type: String(formData.get("customer_type") || "Retail"),
      project: String(formData.get("project") || "General"),
      payment: String(formData.get("payment") || "Cash"),
      note: String(formData.get("note") || "")
    }
    setSubmitLoading(true)
    await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSales((prev) => [...prev, payload])
    // deduct stock
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - qty) } : p))
    setSubmitLoading(false)
    setSaleProductId(""); setSaleQty(1); setSaleUnitPrice(0); setSaleDiscount(0)
    showToast("Sale recorded successfully")
    setPage("sales")
  }

  async function saveSaleEdit(updated: Sale) {
    await fetch("/api/sales", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) })
    setSales((prev) => prev.map((s) => s.sale_id === updated.sale_id ? updated : s))
    setEditingSaleId(null); showToast("Sale updated")
  }

  async function deleteSale(id: string) {
    await fetch("/api/sales", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sale_id: id }) })
    setSales((prev) => prev.filter((s) => s.sale_id !== id))
    setConfirmDelete(null); showToast("Sale deleted")
  }

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

  async function deleteProduct(id: string) {
    await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setConfirmDelete(null); showToast("Product deleted")
  }

  async function saveTarget(month: string, value: number) {
    await fetch("/api/targets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, target: value }) })
    setTargets((prev) => { const idx = prev.findIndex((t) => t.month === month); if (idx >= 0) { const n = [...prev]; n[idx] = { month, target: value }; return n } return [...prev, { month, target: value }] })
    setEditingTarget(null); showToast("Target saved")
  }

  const hasAnyFilter = salesSearch || salesCatFilter || salesPayFilter || salesTypeFilter || salesDateFrom || salesDateTo

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar page={page} setPage={setPage} salesCount={sales.length} lowStockCount={lowStockProducts.length} />

      {receiptSale && <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />}
      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.type === "sale" ? "Delete this sale? This cannot be undone." : "Delete this product? Sales referencing it will remain."}
          onConfirm={() => confirmDelete.type === "sale" ? deleteSale(confirmDelete.id) : deleteProduct(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${toast.type === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
          {toast.msg}
        </div>
      )}

      <div className="pointer-events-none fixed bottom-6 left-64 z-40 hidden items-center gap-1.5 text-xs text-slate-700 xl:flex">
        <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">N</kbd>
        <span>new sale</span>
      </div>

      <main className="ml-60 flex-1 min-w-0 px-8 py-8">
        <div className="mx-auto max-w-6xl animate-fade-in">

          {loading && (
            <div className="flex items-center gap-2.5 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
              Loading data…
            </div>
          )}

          {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
          {!loading && page === "dashboard" && (
            <div className="space-y-5">
              <PageHeader title="Overview" description="Business performance at a glance" />

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={TrendingUp} trend={trends.revTrend} trendLabel="vs last 30d" onClick={() => setPage("analytics")} />
                <StatCard label="Gross Profit" value={formatINR(totalProfit)} icon={Percent} sub={`${overallMarginPct.toFixed(1)}% margin`} onClick={() => setPage("analytics")} />
                <StatCard label="Transactions" value={String(sales.length)} icon={ReceiptText} trend={trends.txTrend} trendLabel="vs last 30d" onClick={() => setPage("sales")} />
                <StatCard label="Avg Order" value={formatINR(avgOrder)} icon={BarChart3} trend={trends.unitsTrend} trendLabel="units 30d" />
              </div>

              {thisMonthTarget && (
                <TargetProgress actual={thisMonthRevenue} target={thisMonthTarget.target}
                  month={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} />
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
                          className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs transition-colors hover:bg-amber-500/20">
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
                            <div key={p.name}>
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
                                <div className="h-1 rounded-full bg-indigo-500/60 transition-all" style={{ width: `${pct}%` }} />
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
          )}

          {/* ── SALES ─────────────────────────────────────────────────────── */}
          {!loading && page === "sales" && (
            <div className="space-y-4">
              <PageHeader
                title="Sales"
                description={`${filteredSales.length} of ${sales.length} transactions`}
                action={
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => exportCSV(filteredSales)}>
                      <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                    <Button className="h-8 gap-1.5 text-xs" onClick={() => setPage("add-sale")}>
                      <Plus className="h-3.5 w-3.5" /> Add Sale
                    </Button>
                  </div>
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-52"><SearchBar value={salesSearch} onChange={setSalesSearch} placeholder="Search product, customer…" /></div>
                <select value={salesCatFilter} onChange={(e) => setSalesCatFilter(e.target.value)}
                  className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
                  <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={salesPayFilter} onChange={(e) => setSalesPayFilter(e.target.value)}
                  className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
                  <option value="">All payments</option>{payments.map((p) => <option key={p}>{p}</option>)}
                </select>
                <select value={salesTypeFilter} onChange={(e) => setSalesTypeFilter(e.target.value)}
                  className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
                  <option value="">All customer types</option>{customerTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <input type="date" value={salesDateFrom} onChange={(e) => setSalesDateFrom(e.target.value)}
                    className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
                  <span className="text-xs text-slate-600">to</span>
                  <input type="date" value={salesDateTo} onChange={(e) => setSalesDateTo(e.target.value)}
                    className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
                </div>
                {hasAnyFilter && (
                  <button onClick={() => { setSalesSearch(""); setSalesCatFilter(""); setSalesPayFilter(""); setSalesTypeFilter(""); setSalesDateFrom(""); setSalesDateTo("") }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              <Card>
                {filteredSales.length === 0 ? (
                  <EmptyState message={sales.length === 0 ? "No sales yet. Press N to add one." : "No results match your filters."} />
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.07]">
                            {[
                              { key: "date", label: "Date" }, { key: "product", label: "Product" },
                              { key: null, label: "Type" }, { key: null, label: "Payment" },
                              { key: "qty", label: "Qty" }, { key: "amount", label: "Amount" }, { key: null, label: "" }
                            ].map(({ key, label }, i) => (
                              <th key={label + i} onClick={() => key && toggleSort(key, salesSortCol, salesSortDir, setSalesSortCol, setSalesSortDir)}
                                className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i >= 4 && i < 6 ? "text-right" : "text-left"} ${key ? "cursor-pointer select-none hover:text-slate-300" : ""}`}>
                                {label}{key && <SortIcon col={key} sortCol={salesSortCol} sortDir={salesSortDir} />}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pagedSales.map((s) =>
                            editingSaleId === s.sale_id ? (
                              <EditSaleRow key={s.sale_id} sale={s} onSave={saveSaleEdit} onCancel={() => setEditingSaleId(null)} />
                            ) : (
                              <tr key={s.sale_id} className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                                <td className="px-5 py-3 text-slate-500">{formatDate(s.date)}</td>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-slate-200">{s.product_name}</p>
                                  {s.customer !== "Walk-in" && <p className="text-xs text-slate-600">{s.customer}</p>}
                                  {s.project !== "General" && <p className="text-[10px] text-slate-700">{s.project}</p>}
                                </td>
                                <td className="px-5 py-3">
                                  <Badge colorClass={customerTypeColors[s.customer_type] ?? customerTypeColors.Other}>{s.customer_type || "Retail"}</Badge>
                                </td>
                                <td className="px-5 py-3">
                                  <Badge colorClass={paymentColors[s.payment] ?? "bg-slate-500/15 text-slate-300"}>{s.payment}</Badge>
                                </td>
                                <td className="px-5 py-3 text-right tabular-nums text-slate-300">{s.qty}</td>
                                <td className="px-5 py-3 text-right tabular-nums">
                                  <span className="font-medium text-slate-200">{formatINR(Number(s.total_amount))}</span>
                                  {s.discount_pct > 0 && <p className="text-xs text-emerald-500">-{s.discount_pct}%</p>}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button onClick={() => setReceiptSale(s)} title="Receipt"
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white/[0.06] hover:text-slate-300">
                                      <Printer className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => setEditingSaleId(s.sale_id)} title="Edit"
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white/[0.06] hover:text-slate-300">
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => setConfirmDelete({ type: "sale", id: s.sale_id })} title="Delete"
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-red-500/10 hover:text-red-400">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-white/[0.07]">
                            <td colSpan={4} className="px-5 py-3 text-xs text-slate-600">{filteredSales.length} transactions</td>
                            <td className="px-5 py-3 text-right tabular-nums text-xs font-medium text-slate-400">{filteredSales.reduce((a, b) => a + Number(b.qty), 0)}</td>
                            <td className="px-5 py-3 text-right tabular-nums text-sm font-semibold text-slate-200">{formatINR(filteredSales.reduce((a, b) => a + Number(b.total_amount), 0))}</td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <Pagination page={salesPage} total={filteredSales.length} pageSize={PAGE_SIZE} onChange={setSalesPage} />
                  </>
                )}
              </Card>
            </div>
          )}

          {/* ── PRODUCTS ──────────────────────────────────────────────────── */}
          {!loading && page === "products" && (
            <div className="space-y-4">
              <PageHeader
                title="Products"
                description={`${filteredProducts.length} of ${products.length} items${lowStockProducts.length > 0 ? ` · ${lowStockProducts.length} low stock` : ""}`}
                action={<Button className="h-8 gap-1.5 text-xs" onClick={() => setPage("settings")}><Plus className="h-3.5 w-3.5" /> Add Product</Button>}
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-52"><SearchBar value={productsSearch} onChange={setProductsSearch} placeholder="Search products…" /></div>
                <select value={productsCatFilter} onChange={(e) => setProductsCatFilter(e.target.value)}
                  className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
                  <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                {(productsSearch || productsCatFilter) && (
                  <button onClick={() => { setProductsSearch(""); setProductsCatFilter("") }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              <Card>
                {filteredProducts.length === 0 ? (
                  <EmptyState message={products.length === 0 ? "No products yet." : "No results."} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.07]">
                          {[
                            { key: null, label: "ID" }, { key: "name", label: "Name" }, { key: null, label: "Category" },
                            { key: null, label: "Size / Thickness" }, { key: "price", label: "Price" },
                            { key: null, label: "Margin" }, { key: "stock", label: "Stock" },
                            { key: null, label: "Units Sold" }, { key: null, label: "" }
                          ].map(({ key, label }, i) => (
                            <th key={label + i} onClick={() => key && toggleSort(key, productsSortCol, productsSortDir, setProductsSortCol, setProductsSortDir)}
                              className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i === 4 || i === 5 || i === 7 ? "text-right" : "text-left"} ${key ? "cursor-pointer select-none hover:text-slate-300" : ""}`}>
                              {label}{key && <SortIcon col={key} sortCol={productsSortCol} sortDir={productsSortDir} />}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => {
                          const margin = p.cost_price > 0 ? ((p.base_price - p.cost_price) / p.base_price) * 100 : null
                          const sold = productSalesCounts.get(p.id)
                          return (
                            <tr key={p.id} className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                              <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                              <td className="px-5 py-3 font-medium text-slate-200">{p.name}</td>
                              <td className="px-5 py-3"><Badge colorClass={categoryColors[p.category]}>{p.category}</Badge></td>
                              <td className="px-5 py-3 text-slate-400">{p.size}{p.thickness !== "-" ? ` · ${p.thickness}` : ""}</td>
                              <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-200">{formatINR(p.base_price)}</td>
                              <td className="px-5 py-3 text-right tabular-nums text-xs">
                                {margin !== null ? (
                                  <span className={margin >= 25 ? "text-emerald-400" : margin >= 15 ? "text-amber-400" : "text-red-400"}>
                                    {margin.toFixed(1)}%
                                  </span>
                                ) : <span className="text-slate-600">—</span>}
                              </td>
                              <td className="px-5 py-3"><StockBadge stock={p.stock} reorder={p.reorder_level} /></td>
                              <td className="px-5 py-3 text-right tabular-nums text-slate-400 text-xs">
                                {sold ? <span>{sold.qty} {p.unit}s</span> : <span className="text-slate-700">—</span>}
                              </td>
                              <td className="px-3 py-3">
                                <button onClick={() => setConfirmDelete({ type: "product", id: p.id })}
                                  className="flex h-6 w-6 items-center justify-center rounded text-slate-700 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── ADD SALE ──────────────────────────────────────────────────── */}
          {!loading && page === "add-sale" && (
            <div className="space-y-5">
              <PageHeader title="Add Sale" description="Record a new transaction" />
              <div className="max-w-xl">
                <Card>
                  <CardContent className="pt-6">
                    <form action={addSale} className="space-y-4">
                      <Field label="Product">
                        <Select name="product_id" required value={saleProductId}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSaleProductId(e.target.value)}>
                          <option value="">Select a product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {formatINR(p.base_price)}/{p.unit}{p.stock <= p.reorder_level ? " ⚠ low stock" : ""}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date"><Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="[color-scheme:dark]" /></Field>
                        <Field label="Payment"><Select name="payment">{payments.map((p) => <option key={p}>{p}</option>)}</Select></Field>
                        <Field label="Quantity">
                          <Input name="qty" type="number" min={1} value={saleQty}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleQty(Number(e.target.value))} required />
                        </Field>
                        <Field label="Unit Price (₹)">
                          <Input name="unit_price" type="number" min={0} step={1} value={saleUnitPrice || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleUnitPrice(Number(e.target.value))} required />
                        </Field>
                        <Field label="Discount %">
                          <Input name="discount_pct" type="number" min={0} max={50} step={0.5} value={saleDiscount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleDiscount(Number(e.target.value))} />
                        </Field>
                        <Field label="Customer Type">
                          <Select name="customer_type">{customerTypes.map((t) => <option key={t}>{t}</option>)}</Select>
                        </Field>
                        <Field label="Customer"><Input name="customer" placeholder="Walk-in" /></Field>
                        <Field label="Project"><Input name="project" placeholder="General" /></Field>
                      </div>
                      <Field label="Note"><Input name="note" placeholder="Optional note" /></Field>
                      <SaleTotalPreview qty={saleQty} unitPrice={saleUnitPrice} discount={saleDiscount} />
                      <Separator />
                      <Button type="submit" className="w-full" disabled={submitLoading}>{submitLoading ? "Saving…" : "Save Sale"}</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────────────────── */}
          {!loading && page === "analytics" && (
            <div className="space-y-5">
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
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" />Top Customers</CardTitle></CardHeader>
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
                            <tr key={c.name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="py-2.5 text-xs text-slate-600">#{i + 1}</td>
                              <td className="py-2.5 font-medium text-slate-200">{c.name}</td>
                              <td className="py-2.5"><Badge colorClass={customerTypeColors[c.type] ?? customerTypeColors.Other}>{c.type}</Badge></td>
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
                                <div className="h-1 rounded-full bg-indigo-500/50" style={{ width: `${pct}%` }} />
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
                    {(() => {
                      const m = new Map<string, number>()
                      for (const s of sales) m.set(s.customer_type || "Retail", (m.get(s.customer_type || "Retail") || 0) + Number(s.total_amount))
                      const sorted = Array.from(m.entries()).sort((a, b) => b[1] - a[1])
                      if (sorted.length === 0) return <p className="text-sm text-slate-600">No data.</p>
                      return (
                        <div className="space-y-2.5">
                          {sorted.map(([type, value]) => {
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
                                  <div className="h-1 rounded-full bg-cyan-500/50" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── SETTINGS ──────────────────────────────────────────────────── */}
          {!loading && page === "settings" && (
            <div className="space-y-5">
              <PageHeader title="Settings" description="Manage products, targets, and data" />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 max-w-5xl">
                <Card>
                  <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
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
                      <Button type="submit" className="w-full" disabled={submitLoading}>{submitLoading ? "Adding…" : "Add Product"}</Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-slate-500" />Monthly Targets</CardTitle></CardHeader>
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
                            <div key={month} className="flex items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-slate-300">{label}</p>
                                <p className="text-[10px] text-slate-600">Actual: {formatINR(actual)}</p>
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1.5">
                                  <input type="number" min={0} value={editingTargetValue} onChange={(e) => setEditingTargetValue(e.target.value)} autoFocus
                                    className="h-7 w-28 rounded border border-indigo-500/40 bg-white/[0.06] px-2 text-right text-xs text-slate-200 focus:outline-none" />
                                  <button onClick={() => saveTarget(month, Number(editingTargetValue))}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"><Check className="h-3 w-3" /></button>
                                  <button onClick={() => setEditingTarget(null)}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-white/[0.05] text-slate-500 hover:text-slate-300"><X className="h-3 w-3" /></button>
                                </div>
                              ) : (
                                <button onClick={() => { setEditingTarget(month); setEditingTargetValue(String(existing?.target || "")) }}
                                  className="group flex items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-slate-200">
                                  {existing ? formatINR(existing.target) : <span className="text-slate-600">Set target…</span>}
                                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" />Data</CardTitle></CardHeader>
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
          )}

        </div>
      </main>
    </div>
  )
}
