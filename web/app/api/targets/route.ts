import { NextResponse } from "next/server"
import { readTargets, writeTargets } from "@/lib/data"
import { SalesTarget } from "@/lib/types"

export async function GET() {
  return NextResponse.json(await readTargets())
}

export async function PUT(req: Request) {
  const body = (await req.json()) as SalesTarget
  const targets = await readTargets()
  const idx = targets.findIndex((t) => t.month === body.month)
  if (idx >= 0) targets[idx] = body
  else targets.push(body)
  await writeTargets(targets)
  return NextResponse.json({ ok: true })
}
