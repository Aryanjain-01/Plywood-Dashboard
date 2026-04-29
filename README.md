# PlywoodPro — Business Sales Dashboard

A full-stack business intelligence dashboard for a plywood & wood products business. Built with Next.js 14, TypeScript, Tailwind CSS, and Recharts.

## Features

### Dashboard
- KPI stat cards — Total Revenue, Units Sold, Transactions, Avg Order Value
- 30-day trend indicators (↑/↓ % vs prior 30 days) on each stat card
- Monthly revenue bar chart with average reference line
- Category mix donut chart with percentage labels
- Top 5 products by revenue with progress bars
- Recent activity feed — click any entry to open its receipt

### Sales
- Full sales table with sortable columns (Date, Product, Qty, Amount)
- Search by product name, customer, project, or sale ID
- Filter by category, payment method, and date range
- Inline row editing — update qty, price, discount, customer, payment
- Delete sale with confirmation
- Receipt / print modal for any sale
- Paginated view (15 rows per page) with footer totals
- Export filtered results to CSV

### Analytics
- 12-week weekly revenue area chart
- Payment method breakdown horizontal bar chart
- Top customers table — order count, total revenue, avg order value
- Revenue by category with percentage breakdown
- Payment mix with percentage bars

### Products
- Product catalogue with search and category filter
- Sortable by name or base price
- Delete product with confirmation

### Add Sale
- Product dropdown with price and unit pre-filled
- Live estimated total that updates with qty, price, and discount
- Unit price auto-fills from selected product's base price
- Date defaults to today

### Settings
- Add new products with ID, name, category, size, thickness, unit, base price
- Business summary stats
- Export all sales to CSV

### General
- Press `N` anywhere to open Add Sale
- Success / error toast notifications
- Persistent JSON storage — no database required

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| UI Primitives | Radix UI |
| Icons | Lucide React |
| Storage | JSON flat files (`data/`) |

## Project Structure

```
Plywood-Dashboard/
├── data/
│   ├── sales.json          # all sales records
│   └── products.json       # product catalogue
└── web/
    ├── app/
    │   ├── api/
    │   │   ├── sales/route.ts      # GET, POST, PUT, DELETE
    │   │   └── products/route.ts   # GET, POST, PUT, DELETE
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx                # main dashboard (all pages)
    ├── components/
    │   ├── dashboard/
    │   │   ├── charts.tsx          # all Recharts components
    │   │   └── sidebar.tsx
    │   └── ui/                     # button, card, input, select, …
    └── lib/
        ├── data.ts                 # JSON read/write helpers
        ├── format.ts               # formatINR, formatDate
        ├── types.ts                # Sale, Product types
        └── utils.ts                # cn()
```

## Getting Started

```bash
# 1. Install dependencies
cd web
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Storage

All data is saved locally as JSON files — no database or internet connection required.

- `data/sales.json` — sales records
- `data/products.json` — product catalogue

## Product Categories

| Category | Description |
|---|---|
| Plywood | 4mm–25mm sheets, 8×4 ft |
| Doors | Flush & Panel, Teak & Sal |
| Cen Mica | Plain, Woodgrain, Matte, Sunmica |
| Veneer | Teak, Rosewood, Wenge, Maple |
| Decoratives | Moulding, Beading, Edge Band, PVC Foam |
| Hardware | Hinges, Dowels |
