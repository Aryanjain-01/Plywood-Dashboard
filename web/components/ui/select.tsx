import * as React from "react"
import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full appearance-none rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground transition-colors outline-none",
        "focus:border-primary/50 focus:bg-input/60 focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
