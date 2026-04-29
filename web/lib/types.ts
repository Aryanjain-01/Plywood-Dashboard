export type Sale = {
  sale_id: string
  date: string
  product_id: string
  product_name: string
  category: string
  qty: number
  unit_price: number
  discount_pct: number
  total_amount: number
  customer: string
  customer_type: string   // "Contractor" | "Retail" | "Builder" | "Dealer" | "Other"
  project: string
  payment: string
  note: string
}

export type Product = {
  id: string
  name: string
  category: string
  size: string
  thickness: string
  unit: string
  base_price: number
  cost_price: number   // for margin calculation
  stock: number        // current stock level
  reorder_level: number // alert threshold
}

export type SalesTarget = {
  month: string   // "YYYY-MM"
  target: number
}
