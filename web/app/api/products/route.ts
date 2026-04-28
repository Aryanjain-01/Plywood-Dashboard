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
