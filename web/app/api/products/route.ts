import { NextResponse } from "next/server"
import { readProducts, writeProducts } from "@/lib/data"
import { Product } from "@/lib/types"

export async function GET() {
  const products = await readProducts()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const body = (await req.json()) as Product
  const products = await readProducts()
  products.push(body)
  await writeProducts(products)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Product
  const products = await readProducts()
  const idx = products.findIndex((p) => p.id === body.id)
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 })
  products[idx] = body
  await writeProducts(products)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: string }
  const products = await readProducts()
  await writeProducts(products.filter((p) => p.id !== id))
  return NextResponse.json({ ok: true })
}
