"use client"

import { useMemo, useState } from "react"
import { Plus, X, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader, SearchBar, Badge, SortIcon, StockBadge, EmptyState } from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR } from "@/lib/format"
import { categories, categoryColors } from "@/lib/constants"
import type { SortDir } from "@/lib/store"

export function ProductsPage() {
  const { products, sales, setPage, setConfirmDelete } = useApp()

  const [productsSearch, setProductsSearch] = useState("")
  const [productsCatFilter, setProductsCatFilter] = useState("")
  const [productsSortCol, setProductsSortCol] = useState<string | null>(null)
  const [productsSortDir, setProductsSortDir] = useState<SortDir>(null)

  const lowStockProducts = useMemo(() =>
    products.filter((p) => p.stock <= p.reorder_level),
    [products])

  function toggleSort(col: string) {
    if (productsSortCol !== col) { setProductsSortCol(col); setProductsSortDir("asc") }
    else if (productsSortDir === "asc") setProductsSortDir("desc")
    else { setProductsSortCol(null); setProductsSortDir(null) }
  }

  const productSalesCounts = useMemo(() => {
    const m = new Map<string, { qty: number; revenue: number }>()
    for (const s of sales) {
      const cur = m.get(s.product_id) || { qty: 0, revenue: 0 }
      m.set(s.product_id, { qty: cur.qty + s.qty, revenue: cur.revenue + Number(s.total_amount) })
    }
    return m
  }, [sales])

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

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader
        title="Products"
        description={`${filteredProducts.length} of ${products.length} items${lowStockProducts.length > 0 ? ` · ${lowStockProducts.length} low stock` : ""}`}
        action={
          <Button className="h-8 gap-1.5 text-xs" onClick={() => setPage("settings")}>
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-52">
          <SearchBar value={productsSearch} onChange={setProductsSearch} placeholder="Search products…" />
        </div>
        <select value={productsCatFilter} onChange={(e) => setProductsCatFilter(e.target.value)}
          className="h-8 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 text-xs text-slate-300 focus:border-indigo-500/50 focus:outline-none">
          <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        {(productsSearch || productsCatFilter) && (
          <button onClick={() => { setProductsSearch(""); setProductsCatFilter("") }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
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
                    { key: null, label: "ID" },
                    { key: "name", label: "Name" },
                    { key: null, label: "Category" },
                    { key: null, label: "Size / Thickness" },
                    { key: "price", label: "Price" },
                    { key: null, label: "Margin" },
                    { key: "stock", label: "Stock" },
                    { key: null, label: "Units Sold" },
                    { key: null, label: "" }
                  ].map(({ key, label }, i) => (
                    <th key={label + i}
                      onClick={() => key && toggleSort(key)}
                      className={`px-5 py-3.5 text-xs font-medium text-slate-500 ${i === 4 || i === 5 || i === 7 ? "text-right" : "text-left"} ${key ? "cursor-pointer select-none hover:text-slate-300 transition-colors" : ""}`}>
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
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-700 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100">
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
  )
}
