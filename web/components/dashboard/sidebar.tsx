"use client"

import type React from "react"
import { LayoutDashboard, PlusCircle, Boxes, ReceiptText, Settings, LineChart, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type Page = "dashboard" | "add-sale" | "products" | "sales" | "analytics" | "settings"

const items: { key: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { key: "add-sale",   label: "Add Sale",   icon: PlusCircle },
  { key: "products",   label: "Products",   icon: Boxes },
  { key: "sales",      label: "Sales",      icon: ReceiptText },
  { key: "analytics",  label: "Analytics",  icon: LineChart },
  { key: "settings",   label: "Settings",   icon: Settings },
]

export function Sidebar({ page, setPage, salesCount, lowStockCount }: {
  page: Page; setPage: (p: Page) => void; salesCount?: number; lowStockCount?: number
}) {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#0c1018]">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm leading-none ring-1 ring-indigo-500/20">
            🪵
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white/90">PlywoodPro</p>
            <p style={{ fontSize: "10px" }} className="uppercase tracking-widest text-white/25">Dashboard</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p style={{ fontSize: "10px" }} className="mb-2 px-2 font-medium uppercase tracking-widest text-white/20">Menu</p>
        {items.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button key={item.key} onClick={() => setPage(item.key)}
              className={cn(
                "group flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-100",
                active ? "bg-indigo-500/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"
              )}>
              <Icon className={cn("h-4 w-4 shrink-0 transition-colors",
                active ? "text-indigo-400" : "text-white/25 group-hover:text-white/50")} />
              <span className="flex-1 text-left">{item.label}</span>

              {item.key === "sales" && salesCount !== undefined && salesCount > 0 && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none",
                  active ? "bg-indigo-400/20 text-indigo-300" : "bg-white/[0.07] text-white/30")}>
                  {salesCount > 999 ? "999+" : salesCount}
                </span>
              )}

              {item.key === "products" && lowStockCount !== undefined && lowStockCount > 0 && (
                <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  active ? "bg-amber-400/20 text-amber-300" : "bg-amber-500/15 text-amber-400")}>
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {lowStockCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-4 pb-5">
        <div className="h-px bg-white/[0.06] mb-4" />
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/30 text-xs font-semibold text-indigo-200 ring-1 ring-white/10">
            AJ
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/75">Aryan Jain</p>
            <p className="truncate text-xs text-white/30">Business Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
