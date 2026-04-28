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
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-base">
            🪵
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">PlywoodPro</p>
            <p className="text-2xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-2 text-2xs font-medium uppercase tracking-widest text-muted-foreground/60">
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
                "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/12 text-foreground"
                  : "text-muted-foreground hover:bg-border/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="mx-4 mb-5 mt-auto">
        <div className="mx-px h-px bg-border mb-4" />
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            AJ
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Aryan Jain</p>
            <p className="truncate text-xs text-muted-foreground">Business Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
