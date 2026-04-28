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
