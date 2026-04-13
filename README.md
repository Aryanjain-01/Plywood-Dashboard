# 🪵 Plywood Business Sales Intelligence Dashboard

A complete business management + analytics dashboard built for a plywood & wood products business.

## Features
- 📊 Live KPIs: Revenue, Units Sold, Transaction count, Avg Order Value
- 📅 Monthly Revenue Bar + Trend Line chart
- 🏆 Top Products by Revenue (horizontal bar)
- 🥧 Category Breakdown Donut chart
- 🏗️ Project-wise Revenue chart
- 💳 Payment Mode analysis
- ➕ Add new sales (category → product → price → customer → project)
- 📦 Product catalog with 25+ pre-loaded items (Plywood, Doors, Cen Mica, Veneer, Decoratives, Hardware)
- ➕ Add new products with custom sizes and thickness
- 📁 Full sales table with filters + CSV export
- ⚙️ Settings and data management

## Product Categories
- **Plywood** — 4mm to 25mm, 8×4 ft sheets
- **Doors** — Flush & Panel, Teak & Sal
- **Cen Mica / Laminates** — Plain, Woodgrain, Matte, Sunmica
- **Veneer** — Teak, Rosewood, Wenge, Maple
- **Decoratives** — Moulding, Beading, Edge Band, PVC Foam
- **Hardware** — Hinges, Dowels

## Setup & Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the dashboard
streamlit run app.py
```

Your browser will open at http://localhost:8501

## Data Storage
All data is saved locally in a `data/` folder as JSON files:
- `data/sales.json` — all sales records
- `data/products.json` — product catalog

No internet or database required!

## Interview Explanation Points

### Architecture
1. **Data Layer**: JSON flat-file "database" — simple, portable, no SQL needed
2. **Session State**: `st.session_state` acts as an in-memory cache, prevents reloading on every interaction
3. **Data Cleaning**: `get_sales_df()` handles type casting, deduplication, null drops
4. **Visualization**: Plotly for interactive charts (tooltips, zoom), Matplotlib-style theming via layout params
5. **UI Routing**: Single `page` variable from sidebar radio controls which section renders

### Key Pandas Operations
- `groupby().agg()` — category/monthly summaries
- `pd.to_datetime()` — date parsing
- `pd.DateOffset()` — date filtering
- `dt.to_period("M")` — monthly grouping
- `nlargest()` — top N products
- `rolling().mean()` — trend line
