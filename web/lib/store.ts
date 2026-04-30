"use client"

import React, { createContext, useContext } from "react"
import { Sale, Product, SalesTarget } from "@/lib/types"

export type Page = "dashboard" | "add-sale" | "products" | "sales" | "analytics" | "settings"
export type SortDir = "asc" | "desc" | null

export interface AppState {
  page: Page
  setPage: (p: Page) => void
  sales: Sale[]
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  targets: SalesTarget[]
  setTargets: React.Dispatch<React.SetStateAction<SalesTarget[]>>
  loading: boolean
  submitLoading: boolean
  setSubmitLoading: React.Dispatch<React.SetStateAction<boolean>>
  showToast: (msg: string, type?: "ok" | "err") => void
  receiptSale: Sale | null
  setReceiptSale: React.Dispatch<React.SetStateAction<Sale | null>>
  confirmDelete: { type: "sale"; id: string } | { type: "product"; id: string } | null
  setConfirmDelete: React.Dispatch<React.SetStateAction<{ type: "sale"; id: string } | { type: "product"; id: string } | null>>
}

export const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
