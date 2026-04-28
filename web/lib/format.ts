export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
