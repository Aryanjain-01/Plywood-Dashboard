import { promises as fs } from "fs"
import path from "path"
import { Product, Sale } from "./types"

const dataDir = path.resolve(process.cwd(), "..", "data")
const salesPath = path.join(dataDir, "sales.json")
const productsPath = path.join(dataDir, "products.json")

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
