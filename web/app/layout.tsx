import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "PlywoodPro Dashboard",
  description: "Business intelligence dashboard"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
