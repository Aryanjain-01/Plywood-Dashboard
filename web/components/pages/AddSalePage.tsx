"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PageHeader, Field, SaleTotalPreview } from "@/components/ui/shared"
import { useApp } from "@/lib/store"
import { formatINR } from "@/lib/format"
import { payments, customerTypes } from "@/lib/constants"
import type { Sale } from "@/lib/types"

export function AddSalePage() {
  const { products, setProducts, setSales, setPage, submitLoading, setSubmitLoading, showToast } = useApp()

  const [saleProductId, setSaleProductId] = useState("")
  const [saleQty, setSaleQty] = useState(1)
  const [saleUnitPrice, setSaleUnitPrice] = useState(0)
  const [saleDiscount, setSaleDiscount] = useState(0)

  useEffect(() => {
    const p = products.find((p) => p.id === saleProductId)
    if (p) setSaleUnitPrice(p.base_price)
  }, [saleProductId, products])

  async function addSale(formData: FormData) {
    const productId = String(formData.get("product_id"))
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const qty = Number(formData.get("qty"))
    const unitPrice = Number(formData.get("unit_price"))
    const discount = Number(formData.get("discount_pct"))
    const total = qty * unitPrice * (1 - discount / 100)
    const payload: Sale = {
      sale_id: `S${Date.now()}`,
      date: String(formData.get("date")),
      product_id: product.id, product_name: product.name, category: product.category,
      qty, unit_price: unitPrice, discount_pct: discount, total_amount: Number(total.toFixed(2)),
      customer: String(formData.get("customer") || "Walk-in"),
      customer_type: String(formData.get("customer_type") || "Retail"),
      project: String(formData.get("project") || "General"),
      payment: String(formData.get("payment") || "Cash"),
      note: String(formData.get("note") || "")
    }
    setSubmitLoading(true)
    await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSales((prev) => [...prev, payload])
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - qty) } : p))
    setSubmitLoading(false)
    setSaleProductId(""); setSaleQty(1); setSaleUnitPrice(0); setSaleDiscount(0)
    showToast("Sale recorded successfully")
    setPage("sales")
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <PageHeader title="Add Sale" description="Record a new transaction" />
      <div className="max-w-xl">
        <Card>
          <CardContent className="pt-6">
            <form action={addSale} className="space-y-4">
              <Field label="Product">
                <Select name="product_id" required value={saleProductId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSaleProductId(e.target.value)}>
                  <option value="">Select a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatINR(p.base_price)}/{p.unit}{p.stock <= p.reorder_level ? " ⚠ low stock" : ""}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="[color-scheme:dark]" />
                </Field>
                <Field label="Payment">
                  <Select name="payment">{payments.map((p) => <option key={p}>{p}</option>)}</Select>
                </Field>
                <Field label="Quantity">
                  <Input name="qty" type="number" min={1} value={saleQty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleQty(Number(e.target.value))} required />
                </Field>
                <Field label="Unit Price (₹)">
                  <Input name="unit_price" type="number" min={0} step={1} value={saleUnitPrice || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleUnitPrice(Number(e.target.value))} required />
                </Field>
                <Field label="Discount %">
                  <Input name="discount_pct" type="number" min={0} max={50} step={0.5} value={saleDiscount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaleDiscount(Number(e.target.value))} />
                </Field>
                <Field label="Customer Type">
                  <Select name="customer_type">{customerTypes.map((t) => <option key={t}>{t}</option>)}</Select>
                </Field>
                <Field label="Customer">
                  <Input name="customer" placeholder="Walk-in" />
                </Field>
                <Field label="Project">
                  <Input name="project" placeholder="General" />
                </Field>
              </div>
              <Field label="Note">
                <Input name="note" placeholder="Optional note" />
              </Field>
              <SaleTotalPreview qty={saleQty} unitPrice={saleUnitPrice} discount={saleDiscount} />
              <Separator />
              <Button type="submit" className="w-full" disabled={submitLoading}>
                {submitLoading ? "Saving…" : "Save Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
