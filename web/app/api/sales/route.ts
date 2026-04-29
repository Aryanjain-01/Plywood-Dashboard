import { NextResponse } from "next/server"
import { readSales, writeSales } from "@/lib/data"
import { Sale } from "@/lib/types"

export async function GET() {
  const sales = await readSales()
  return NextResponse.json(sales)
}

export async function POST(req: Request) {
  const body = (await req.json()) as Sale
  const sales = await readSales()
  sales.push(body)
  await writeSales(sales)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Sale
  const sales = await readSales()
  const idx = sales.findIndex((s) => s.sale_id === body.sale_id)
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 })
  sales[idx] = body
  await writeSales(sales)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { sale_id } = (await req.json()) as { sale_id: string }
  const sales = await readSales()
  await writeSales(sales.filter((s) => s.sale_id !== sale_id))
  return NextResponse.json({ ok: true })
}
