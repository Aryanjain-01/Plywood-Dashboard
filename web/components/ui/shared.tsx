"use client"

import React, { useRef, useEffect } from "react"
import { AlertTriangle, ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ReceiptText, Search, X, Target, Printer, TrendingUp, TrendingDown, BarChart3, Percent, Check, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate, formatINR } from "@/lib/format"
import { payments, customerTypes } from "@/lib/constants"
import { Sale } from "@/lib/types"

type SortDir = "asc" | "desc" | null

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-slate-400">{children}</label>
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>
}

export function PageHeader({ title, description, action }: {
  title: string; description?: string; action?: React.ReactNode
}) {
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

export function Badge({ children, colorClass }: { children: React.ReactNode; colorClass?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", colorClass ?? "bg-indigo-500/10 text-indigo-400")}>
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon = ReceiptText, message }: {
  icon?: React.ComponentType<{ className?: string }>; message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

export function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: string | null; sortDir: SortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-slate-600" />
  return sortDir === "asc"
    ? <ChevronUp className="ml-1 inline h-3 w-3 text-indigo-400" />
    : <ChevronDown className="ml-1 inline h-3 w-3 text-indigo-400" />
}

export function SearchBar({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.04] pl-8 pr-8 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
      <span className="text-xs text-slate-600">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const n = pages <= 7 ? i + 1 : i < 3 ? i + 1 : i === 3 ? page : i === 4 ? Math.min(page + 1, pages - 1) : i === 5 ? -1 : pages
          if (n === -1) return <span key="e" className="px-1 text-xs text-slate-600">…</span>
          return (
            <button key={n} onClick={() => onChange(n)}
              className={cn(
                "flex h-7 min-w-[28px] items-center justify-center rounded-md px-1 text-xs font-medium transition-colors",
                n === page ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
              )}>
              {n}
            </button>
          )
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  if (stock === 0) return (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
      <AlertTriangle className="h-3 w-3" />Out
    </span>
  )
  if (stock <= reorder) return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
      <AlertTriangle className="h-3 w-3" />Low
    </span>
  )
  return <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">{stock}</span>
}

export function SaleTotalPreview({ qty, unitPrice, discount }: { qty: number; unitPrice: number; discount: number }) {
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

export function TargetProgress({ actual, target, month }: { actual: number; target: number; month: string }) {
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
        <div
          className={cn("h-1.5 rounded-full transition-all duration-700", over ? "bg-emerald-500" : pct > 70 ? "bg-indigo-500" : pct > 40 ? "bg-amber-500" : "bg-red-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={cn("text-[10px] font-medium", over ? "text-emerald-400" : "text-slate-600")}>
          {over ? `+${formatINR(actual - target)} over target` : `${formatINR(target - actual)} remaining`}
        </span>
        <span className="text-[10px] text-slate-600">{pct.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
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
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-white/[0.10] bg-[#161b24] shadow-2xl animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <p className="text-sm font-semibold text-slate-100">Receipt — {sale.sale_id}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-7 gap-1.5 text-xs" onClick={handlePrint}>
              <Printer className="h-3 w-3" /> Print
            </Button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div ref={ref} className="px-5 py-4 font-mono text-xs text-slate-300">
          <h2 className="mb-1 text-center text-sm font-bold text-slate-100">PlywoodPro</h2>
          <p className="mb-4 text-center text-slate-500">{formatDate(sale.date)}</p>
          <div className="space-y-1.5">
            {[
              ["Receipt No", sale.sale_id],
              ["Customer", sale.customer],
              ["Type", sale.customer_type || "—"],
              ["Payment", sale.payment],
              ...(sale.project !== "General" ? [["Project", sale.project]] : [])
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <div className="my-3 border-t border-dashed border-white/[0.10]" />
          <div className="space-y-1">
            <p className="text-slate-300">{sale.product_name}</p>
            <div className="flex justify-between text-slate-500">
              <span>{sale.qty} × {formatINR(sale.unit_price)}</span>
              <span>{formatINR(sale.qty * sale.unit_price)}</span>
            </div>
            {sale.discount_pct > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({sale.discount_pct}%)</span>
                <span>−{formatINR(sale.qty * sale.unit_price * sale.discount_pct / 100)}</span>
              </div>
            )}
          </div>
          <div className="my-3 border-t border-dashed border-white/[0.10]" />
          <div className="flex justify-between text-sm font-semibold text-slate-100">
            <span>Total</span>
            <span>{formatINR(sale.total_amount)}</span>
          </div>
          {sale.note && <p className="mt-3 text-xs text-slate-600">Note: {sale.note}</p>}
          <p className="mt-4 text-center text-slate-600">Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}

export function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onCancel}>
      <div className="w-full max-w-xs rounded-xl border border-white/[0.10] bg-[#161b24] p-5 shadow-2xl animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-slate-300">{message}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 text-xs" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 bg-red-500/90 text-xs hover:bg-red-500" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, sub, onClick }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>
  trend?: number; trendLabel?: string; sub?: string; onClick?: () => void
}) {
  const up = trend !== undefined && trend >= 0
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#161b22] p-5 transition-all duration-200",
        onClick && "cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.02] hover:shadow-lg hover:shadow-indigo-500/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
          {trend !== undefined && (
            <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", up ? "text-emerald-400" : "text-red-400")}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{up ? "+" : ""}{trend.toFixed(1)}%</span>
              {trendLabel && <span className="font-normal text-slate-600">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn(
          "shrink-0 rounded-lg p-2 transition-colors duration-200",
          onClick ? "bg-indigo-500/10 group-hover:bg-indigo-500/20" : "bg-indigo-500/10"
        )}>
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
      </div>
      {onClick && (
        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-indigo-500/20 transition-opacity duration-200 group-hover:opacity-100" />
      )}
    </div>
  )
}

export function EditSaleRow({ sale, onSave, onCancel }: {
  sale: Sale; onSave: (s: Sale) => void; onCancel: () => void
}) {
  const [qty, setQty] = React.useState(sale.qty)
  const [unitPrice, setUnitPrice] = React.useState(sale.unit_price)
  const [discount, setDiscount] = React.useState(sale.discount_pct)
  const [customer, setCustomer] = React.useState(sale.customer)
  const [customerType, setCustomerType] = React.useState(sale.customer_type || "Retail")
  const [payment, setPayment] = React.useState(sale.payment)
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
          <button onClick={save} className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">
            <Check className="h-3 w-3" />
          </button>
          <button onClick={onCancel} className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.05] text-slate-500 hover:text-slate-300">
            <X className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}
