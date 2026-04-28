"use client"

import type React from "react"
import { LayoutDashboard, PlusCircle, Boxes, ReceiptText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type Page = "dashboard" | "add-sale" | "products" | "sales" | "settings"

const items: { key: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "add-sale", label: "Add Sale", icon: PlusCircle },
  { key: "products", label: "Products", icon: Boxes },
  { key: "sales", label: "Sales", icon: ReceiptText },
  { key: "settings", label: "Settings", icon: Settings }
]

export function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[oklch(0.10_0.012_265)]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-sm leading-none">
            🪵
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white/90">PlywoodPro</p>
            <p style={{ fontSize: "10px" }} className="uppercase tracking-widest text-white/30">Dashboard</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p style={{ fontSize: "10px" }} className="mb-2 px-2 font-medium uppercase tracking-widest text-white/25">
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={cn(
                "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-100",
                active
                  ? "bg-indigo-500/[0.12] text-white"
                  : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-white/30")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 pb-5">
        <div className="h-px bg-white/[0.06] mb-4" />
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/25 text-xs font-semibold text-indigo-300">
            AJ
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/80">Aryan Jain</p>
            <p className="truncate text-xs text-white/35">Business Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
