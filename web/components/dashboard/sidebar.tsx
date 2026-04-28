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
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex h-full flex-col p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-3xl">🪵</div>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-100">PlywoodPro</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Business Intelligence</p>
        </div>

        <nav className="mt-5 space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const active = page === item.key
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={cn(
                  "relative flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-gray-300 transition-all duration-300 ease-in-out hover:translate-x-1 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
                  active && "bg-gradient-to-r from-blue-500/20 to-transparent text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                )}
              >
                {active && <span className="absolute left-1 h-6 w-0.5 rounded-full bg-blue-400" />}
                <Icon className={cn("h-5 w-5 text-gray-400", active && "text-blue-400")} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-sm font-medium text-slate-100">Aryan Jain</p>
          <p className="text-xs text-slate-400">Business Admin</p>
        </div>
      </div>
    </aside>
  )
}
