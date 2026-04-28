import * as React from "react"
import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/45",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
