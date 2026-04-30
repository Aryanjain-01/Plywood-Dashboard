"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardPage } from "@/components/pages/DashboardPage"
import { SalesPage } from "@/components/pages/SalesPage"
import { ProductsPage } from "@/components/pages/ProductsPage"
import { AddSalePage } from "@/components/pages/AddSalePage"
import { AnalyticsPage } from "@/components/pages/AnalyticsPage"
import { SettingsPage } from "@/components/pages/SettingsPage"
import { ReceiptModal, ConfirmModal } from "@/components/ui/shared"
import { AppContext, type Page } from "@/lib/store"
import type { Sale, Product, SalesTarget } from "@/lib/types"

export default function HomePage() {
  const [page, setPage] = useState<Page>("dashboard")
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<
    { type: "sale"; id: string } | { type: "product"; id: string } | null
  >(null)

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load all data once
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [sr, pr, tr] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/products"),
        fetch("/api/targets"),
      ])
      setSales(await sr.json())
      setProducts(await pr.json())
      setTargets(await tr.json())
      setLoading(false)
    })()
  }, [])

  // Keyboard shortcut: N → add sale
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "n" || e.key === "N") setPage("add-sale")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  async function deleteSale(id: string) {
    await fetch("/api/sales", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sale_id: id }),
    })
    setSales((prev) => prev.filter((s) => s.sale_id !== id))
    setConfirmDelete(null)
    showToast("Sale deleted")
  }

  async function deleteProduct(id: string) {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setConfirmDelete(null)
    showToast("Product deleted")
  }

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= p.reorder_level).length,
    [products]
  )

  return (
    <AppContext.Provider
      value={{
        page, setPage,
        sales, setSales,
        products, setProducts,
        targets, setTargets,
        loading,
        submitLoading, setSubmitLoading,
        showToast,
        receiptSale, setReceiptSale,
        confirmDelete, setConfirmDelete,
      }}
    >
      <div className="flex min-h-screen bg-[#0d1117]">
        <Sidebar
          page={page}
          setPage={setPage}
          salesCount={sales.length}
          lowStockCount={lowStockCount}
        />

        {receiptSale && (
          <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
        )}

        {confirmDelete && (
          <ConfirmModal
            message={
              confirmDelete.type === "sale"
                ? "Delete this sale? This cannot be undone."
                : "Delete this product? Sales referencing it will remain."
            }
            onConfirm={() =>
              confirmDelete.type === "sale"
                ? deleteSale(confirmDelete.id)
                : deleteProduct(confirmDelete.id)
            }
            onCancel={() => setConfirmDelete(null)}
          />
        )}

        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm animate-toast ${
              toast.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                toast.type === "ok" ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            {toast.msg}
          </div>
        )}

        <div className="pointer-events-none fixed bottom-6 left-64 z-40 hidden items-center gap-1.5 text-xs text-slate-700 xl:flex">
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5">N</kbd>
          <span>new sale</span>
        </div>

        <main className="ml-60 flex-1 min-w-0 px-8 py-8">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
                Loading data…
              </div>
            ) : (
              <>
                {page === "dashboard"  && <DashboardPage />}
                {page === "sales"      && <SalesPage />}
                {page === "products"   && <ProductsPage />}
                {page === "add-sale"   && <AddSalePage />}
                {page === "analytics"  && <AnalyticsPage />}
                {page === "settings"   && <SettingsPage />}
              </>
            )}
          </div>
        </main>
      </div>
    </AppContext.Provider>
  )
}
