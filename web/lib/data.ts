import { promises as fs } from "fs"
import path from "path"
import { Product, Sale, SalesTarget } from "./types"

const dataDir = path.resolve(process.cwd(), "..", "data")
const salesPath = path.join(dataDir, "sales.json")
const productsPath = path.join(dataDir, "products.json")
const targetsPath = path.join(dataDir, "targets.json")

export async function readSales(): Promise<Sale[]> {
  const raw = await fs.readFile(salesPath, "utf-8")
  return JSON.parse(raw)
}

export async function writeSales(sales: Sale[]) {
  await fs.writeFile(salesPath, JSON.stringify(sales, null, 2))
}

export async function readProducts(): Promise<Product[]> {
  const raw = await fs.readFile(productsPath, "utf-8")
  return JSON.parse(raw)
}

export async function writeProducts(products: Product[]) {
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2))
}

export async function readTargets(): Promise<SalesTarget[]> {
  try {
    const raw = await fs.readFile(targetsPath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function writeTargets(targets: SalesTarget[]) {
  await fs.writeFile(targetsPath, JSON.stringify(targets, null, 2))
}
