import * as React from "react"
import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#1a1f28] px-3 py-2 text-sm text-slate-200 outline-none transition-colors",
        "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
