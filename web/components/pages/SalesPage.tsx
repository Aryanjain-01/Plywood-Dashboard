"use client"

import { useMemo, useState } from "react"
import { Download, Plus, Calendar, X, Printer, Pencil, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PageHeader, SearchBar, Badge, SortIcon, EmptyState,
  EditSaleRow, Pagination
} from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR, formatDate } from "@/lib/format"
import { categories, payments, customerTypes, paymentColors, customerTypeColors, PAGE_SIZE } from "@/lib/constants"
import type { Sale } from "@/lib/types"
import type { SortDir } from "@/lib/store"

export function SalesPage() {
  const { sales, setSales, setPage, setReceiptSale, setConfirmDelete, showToast } = useApp()

  const [salesSearch, setSalesSearch] = useState("")
  const [salesCatFilter, setSalesCatFilter] = useState("")
  const [salesPayFilter, setSalesPayFilter] = useState("")
  const [salesTypeFilter, setSalesTypeFilter] = useState("")
  const [salesDateFrom, setSalesDateFrom] = useState("")
  const [salesDateTo, setSalesDateTo] = useState("")
  const [salesSortCol, setSalesSortCol] = useState<string | null>("date")
  const [salesSortDir, setSalesSortDir] = useState<SortDir>("desc")
  const [salesPage, setSalesPage] = useState(1)
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

  const hasAnyFilter = salesSearch || salesCatFilter || salesPayFilter || salesTypeFilter || salesDateFrom || salesDateTo

  function toggleSort(col: string) {
    if (salesSortCol !== col) { setSalesSortCol(col); setSalesSortDir("asc") }
    else if (salesSortDir === "asc") setSalesSortDir("desc")
    else { setSalesSortCol(null); setSalesSortDir(null) }
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

  async function saveSaleEdit(updated: Sale) {
    await fetch("/api/sales", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) })
    setSales((prev) => prev.map((s) => s.sale_id === updated.sale_id ? updated : s))
    setEditingSaleId(null); showToast("Sale updated")
  }

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

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        <div className="w-52">
          <SearchBar value={salesSearch} onChange={(v) => { setSalesSearch(v); setSalesPage(1) }} placeholder="Search product, customer…" />
        </div>
        <select value={salesCatFilter} onChange={(e) => { setSalesCatFilter(e.target.value); setSalesPage(1) }}
          className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
          <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={salesPayFilter} onChange={(e) => { setSalesPayFilter(e.target.value); setSalesPage(1) }}
          className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
          <option value="">All payments</option>{payments.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={salesTypeFilter} onChange={(e) => { setSalesTypeFilter(e.target.value); setSalesPage(1) }}
          className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
          <option value="">All customer types</option>{customerTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-600" />
          <input type="date" value={salesDateFrom} onChange={(e) => { setSalesDateFrom(e.target.value); setSalesPage(1) }}
            className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
          <span className="text-xs text-slate-600">to</span>
          <input type="date" value={salesDateTo} onChange={(e) => { setSalesDateTo(e.target.value); setSalesPage(1) }}
            className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
        </div>
        {hasAnyFilter && (
          <button onClick={() => { setSalesSearch(""); setSalesCatFilter(""); setSalesPayFilter(""); setSalesTypeFilter(""); setSalesDateFrom(""); setSalesDateTo(""); setSalesPage(1) }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
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
                      { key: "date", label: "Date" },
                      { key: "product", label: "Product" },
                      { key: null, label: "Type" },
                      { key: null, label: "Payment" },
                      { key: "qty", label: "Qty" },
                      { key: "amount", label: "Amount" },
                      { key: null, label: "" }
                    ].map(({ key, label }, i) => (
                      <th key={label + i}
                        onClick={() => key && toggleSort(key)}
                        className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i >= 4 && i < 6 ? "text-right" : "text-left"} ${key ? "cursor-pointer select-none hover:text-slate-300 transition-colors" : ""}`}>
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
                              className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white/[0.06] hover:text-slate-300 transition-colors">
                              <Printer className="h-3 w-3" />
                            </button>
                            <button onClick={() => setEditingSaleId(s.sale_id)} title="Edit"
                              className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white/[0.06] hover:text-slate-300 transition-colors">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => setConfirmDelete({ type: "sale", id: s.sale_id })} title="Delete"
                              className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-colors">
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
                    <td className="px-5 py-3 text-right tabular-nums text-xs font-medium text-slate-400">
                      {filteredSales.reduce((a, b) => a + Number(b.qty), 0)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-sm font-semibold text-slate-200">
                      {formatINR(filteredSales.reduce((a, b) => a + Number(b.total_amount), 0))}
                    </td>
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
  )
}
