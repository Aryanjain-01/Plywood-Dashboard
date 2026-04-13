"""
=============================================================
  PLYWOOD BUSINESS SALES INTELLIGENCE DASHBOARD
  Built with Streamlit | Pandas | Matplotlib | Plotly
=============================================================
  This app helps manage and visualize sales for a plywood
  and wood products business — including:
    - Products catalog (Plywood, Doors, Cen Mica, Veneer, Decoratives)
    - Sales entry with sizes, quantities, pricing
    - Charts: monthly revenue, top products, category breakdown
    - Project-wise tracking
=============================================================
"""

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import plotly.express as px
import plotly.graph_objects as go
import os
import json
from datetime import datetime, date
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# 1. PAGE CONFIG  (must be the FIRST st call)
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="Plywood Business Dashboard",
    page_icon="🪵",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─────────────────────────────────────────────
# 2. CUSTOM CSS — warm wood-toned industrial UI
# ─────────────────────────────────────────────
st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
  }

  /* Background */
  .stApp {
    background: #1a1208;
    color: #f0e6d3;
  }

  /* Sidebar */
  section[data-testid="stSidebar"] {
    background: #120d05 !important;
    border-right: 1px solid #3d2e1a;
  }
  section[data-testid="stSidebar"] * { color: #d4c4a8 !important; }
  section[data-testid="stSidebar"] .stSelectbox label,
  section[data-testid="stSidebar"] .stRadio label { color: #a89070 !important; }

  /* Metric cards */
  div[data-testid="metric-container"] {
    background: linear-gradient(135deg, #2a1f0e 0%, #1e1608 100%);
    border: 1px solid #5c3d1e;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  div[data-testid="metric-container"] label { color: #a89070 !important; font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase; }
  div[data-testid="metric-container"] [data-testid="stMetricValue"] { color: #f5d78e !important; font-size: 1.8rem; font-weight: 600; }
  div[data-testid="metric-container"] [data-testid="stMetricDelta"] { color: #72c472 !important; }

  /* Section headers */
  .section-header {
    font-family: 'DM Serif Display', serif;
    font-size: 1.4rem;
    color: #f5d78e;
    border-bottom: 2px solid #5c3d1e;
    padding-bottom: 8px;
    margin: 24px 0 16px 0;
    letter-spacing: 0.5px;
  }

  /* Card wrapper */
  .card {
    background: #231a0c;
    border: 1px solid #3d2e1a;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 16px;
  }

  /* Success/info boxes */
  .stSuccess { background: #0d2e0d !important; border: 1px solid #2d6b2d !important; }
  .stInfo    { background: #0d1e35 !important; border: 1px solid #1e4b8c !important; }
  .stWarning { background: #2e1e0d !important; border: 1px solid #6b4a1e !important; }

  /* Buttons */
  .stButton > button {
    background: linear-gradient(135deg, #8B5E2A, #6B4010);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 10px 24px;
    transition: all 0.2s;
  }
  .stButton > button:hover {
    background: linear-gradient(135deg, #a87040, #8B5E2A);
    box-shadow: 0 4px 14px rgba(139,94,42,0.5);
    transform: translateY(-1px);
  }

  /* Dataframe */
  .stDataFrame { border: 1px solid #3d2e1a !important; border-radius: 10px; overflow: hidden; }

  /* Inputs */
  .stTextInput input, .stNumberInput input, .stSelectbox select,
  .stDateInput input, .stTextArea textarea {
    background: #2a1f0e !important;
    border: 1px solid #5c3d1e !important;
    color: #f0e6d3 !important;
    border-radius: 8px !important;
  }

  /* Tabs */
  .stTabs [data-baseweb="tab-list"] { background: #1e1608; border-radius: 10px; padding: 4px; }
  .stTabs [data-baseweb="tab"] { color: #a89070; border-radius: 8px; font-weight: 500; }
  .stTabs [aria-selected="true"] { background: #5c3d1e !important; color: #f5d78e !important; }

  /* Hide default Streamlit elements */
  #MainMenu, footer, header { visibility: hidden; }

  /* Logo area */
  .logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: #f5d78e;
    line-height: 1;
  }
  .logo-sub {
    font-size: 0.75rem;
    color: #a89070;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Big title banner */
  .hero-banner {
    background: linear-gradient(135deg, #3d2200 0%, #1a1208 60%);
    border: 1px solid #5c3d1e;
    border-radius: 16px;
    padding: 28px 36px;
    margin-bottom: 24px;
  }
  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2.2rem;
    color: #f5d78e;
    margin: 0;
  }
  .hero-sub { color: #a89070; font-size: 0.9rem; margin-top: 6px; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────
# 3. DATA PERSISTENCE — JSON flat-file "database"
#    (No SQL needed; everything lives in two JSON files)
# ─────────────────────────────────────────────
DATA_DIR   = "data"
SALES_FILE = os.path.join(DATA_DIR, "sales.json")
PRODS_FILE = os.path.join(DATA_DIR, "products.json")

os.makedirs(DATA_DIR, exist_ok=True)

# ── Default product catalog ──────────────────
DEFAULT_PRODUCTS = [
    # Plywood sizes
    {"id":"P001","name":"Plywood 8x4 ft (4mm)","category":"Plywood","size":"8x4 ft","thickness":"4mm","unit":"sheet","base_price":650},
    {"id":"P002","name":"Plywood 8x4 ft (6mm)","category":"Plywood","size":"8x4 ft","thickness":"6mm","unit":"sheet","base_price":800},
    {"id":"P003","name":"Plywood 8x4 ft (9mm)","category":"Plywood","size":"8x4 ft","thickness":"9mm","unit":"sheet","base_price":1050},
    {"id":"P004","name":"Plywood 8x4 ft (12mm)","category":"Plywood","size":"8x4 ft","thickness":"12mm","unit":"sheet","base_price":1300},
    {"id":"P005","name":"Plywood 8x4 ft (18mm)","category":"Plywood","size":"8x4 ft","thickness":"18mm","unit":"sheet","base_price":1700},
    {"id":"P006","name":"Plywood 8x4 ft (25mm)","category":"Plywood","size":"8x4 ft","thickness":"25mm","unit":"sheet","base_price":2200},
    # Doors
    {"id":"D001","name":"Flush Door 7x3 ft","category":"Doors","size":"7x3 ft","thickness":"35mm","unit":"piece","base_price":3500},
    {"id":"D002","name":"Flush Door 7x3.5 ft","category":"Doors","size":"7x3.5 ft","thickness":"35mm","unit":"piece","base_price":4000},
    {"id":"D003","name":"Panel Door Teak","category":"Doors","size":"7x3 ft","thickness":"40mm","unit":"piece","base_price":7500},
    {"id":"D004","name":"Panel Door Sal","category":"Doors","size":"7x3 ft","thickness":"40mm","unit":"piece","base_price":5500},
    # Cen Mica / Laminates
    {"id":"L001","name":"Cen Mica (Plain)","category":"Cen Mica","size":"8x4 ft","thickness":"1mm","unit":"sheet","base_price":900},
    {"id":"L002","name":"Cen Mica (Woodgrain)","category":"Cen Mica","size":"8x4 ft","thickness":"1mm","unit":"sheet","base_price":1100},
    {"id":"L003","name":"Cen Mica (Matte)","category":"Cen Mica","size":"8x4 ft","thickness":"1mm","unit":"sheet","base_price":1050},
    {"id":"L004","name":"Sunmica Plain","category":"Cen Mica","size":"8x4 ft","thickness":"1mm","unit":"sheet","base_price":850},
    # Veneer
    {"id":"V001","name":"Teak Veneer","category":"Veneer","size":"8x4 ft","thickness":"0.5mm","unit":"sheet","base_price":1800},
    {"id":"V002","name":"Rosewood Veneer","category":"Veneer","size":"8x4 ft","thickness":"0.5mm","unit":"sheet","base_price":2200},
    {"id":"V003","name":"Wenge Veneer","category":"Veneer","size":"8x4 ft","thickness":"0.5mm","unit":"sheet","base_price":2400},
    {"id":"V004","name":"Maple Veneer","category":"Veneer","size":"8x4 ft","thickness":"0.5mm","unit":"sheet","base_price":2000},
    # Decoratives
    {"id":"DC001","name":"Wooden Moulding (per mtr)","category":"Decoratives","size":"per mtr","thickness":"-","unit":"mtr","base_price":120},
    {"id":"DC002","name":"Beading Strip","category":"Decoratives","size":"per mtr","thickness":"-","unit":"mtr","base_price":80},
    {"id":"DC003","name":"Edge Band Tape","category":"Decoratives","size":"per mtr","thickness":"-","unit":"mtr","base_price":15},
    {"id":"DC004","name":"PVC Foam Sheet","category":"Decoratives","size":"8x4 ft","thickness":"5mm","unit":"sheet","base_price":550},
    # Hardware
    {"id":"H001","name":"Piano Hinge (per ft)","category":"Hardware","size":"per ft","thickness":"-","unit":"ft","base_price":35},
    {"id":"H002","name":"Wooden Dowel (per pkt)","category":"Hardware","size":"standard","thickness":"-","unit":"packet","base_price":85},
]

# ── Default sample sales (last 6 months) ─────
import random
from dateutil.relativedelta import relativedelta

def _gen_sample_sales():
    """Generate 80 realistic sample transactions."""
    random.seed(42)
    rows = []
    categories = {
        "Plywood":     ["P001","P002","P003","P004","P005","P006"],
        "Doors":       ["D001","D002","D003","D004"],
        "Cen Mica":    ["L001","L002","L003","L004"],
        "Veneer":      ["V001","V002","V003","V004"],
        "Decoratives": ["DC001","DC002","DC003","DC004"],
        "Hardware":    ["H001","H002"],
    }
    prod_price = {p["id"]: p["base_price"] for p in DEFAULT_PRODUCTS}
    prod_name  = {p["id"]: p["name"]  for p in DEFAULT_PRODUCTS}
    customers  = ["Sharma Interiors","Gupta Builders","Ravi Contractors",
                  "Modern Furniture","City Construction","Krishna Works",
                  "Priya Decor","Elite Interiors","Rajasthan Constructions","Home Craft"]
    projects   = ["Residential Flat","Office Renovation","Hotel Project",
                  "School Building","Showroom Fit-out","Walk-in Wardrobe",
                  "Kitchen Cabinet","Retail Store","Hospital Renovation","General"]
    today = date.today()
    for i in range(80):
        months_ago = random.randint(0, 5)
        day        = random.randint(1, 28)
        sale_date  = (today - relativedelta(months=months_ago)).replace(day=day)
        cat  = random.choice(list(categories.keys()))
        pid  = random.choice(categories[cat])
        qty  = random.randint(1, 20)
        disc = random.choice([0, 0, 0, 2, 5, 8, 10])
        price_unit = prod_price[pid] * random.uniform(0.95, 1.10)
        total = round(qty * price_unit * (1 - disc/100), 2)
        rows.append({
            "sale_id":   f"S{1000+i}",
            "date":      sale_date.strftime("%Y-%m-%d"),
            "product_id": pid,
            "product_name": prod_name[pid],
            "category":  cat,
            "qty":       qty,
            "unit_price": round(price_unit, 2),
            "discount_pct": disc,
            "total_amount": total,
            "customer":  random.choice(customers),
            "project":   random.choice(projects),
            "payment":   random.choice(["Cash","UPI","Cheque","Credit"]),
            "note":      ""
        })
    return rows


def load_products():
    if os.path.exists(PRODS_FILE):
        with open(PRODS_FILE) as f:
            return json.load(f)
    save_products(DEFAULT_PRODUCTS)
    return DEFAULT_PRODUCTS

def save_products(data):
    with open(PRODS_FILE, "w") as f:
        json.dump(data, f, indent=2)

def load_sales():
    if os.path.exists(SALES_FILE):
        with open(SALES_FILE) as f:
            return json.load(f)
    sample = _gen_sample_sales()
    save_sales(sample)
    return sample

def save_sales(data):
    with open(SALES_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ─────────────────────────────────────────────
# 4. DATA HELPERS — turn JSON into DataFrames
#    and do all cleaning / type-casting here
# ─────────────────────────────────────────────

def get_sales_df(sales_list):
    """
    Convert raw sales list → clean DataFrame.
    Steps:
      • Cast date to datetime
      • Cast numeric cols to float/int
      • Drop any duplicate sale_ids
      • Derive 'month_label' for charts
    """
    if not sales_list:
        return pd.DataFrame()
    df = pd.DataFrame(sales_list)
    df["date"]          = pd.to_datetime(df["date"], errors="coerce")
    df["total_amount"]  = pd.to_numeric(df["total_amount"], errors="coerce").fillna(0)
    df["qty"]           = pd.to_numeric(df["qty"],          errors="coerce").fillna(0).astype(int)
    df["unit_price"]    = pd.to_numeric(df["unit_price"],   errors="coerce").fillna(0)
    df["discount_pct"]  = pd.to_numeric(df["discount_pct"],errors="coerce").fillna(0)
    df.drop_duplicates(subset="sale_id", keep="last", inplace=True)
    df.dropna(subset=["date"], inplace=True)
    df["month_label"] = df["date"].dt.strftime("%b %Y")
    df["month_order"] = df["date"].dt.to_period("M")
    df.sort_values("date", inplace=True)
    return df

def get_products_df(products_list):
    return pd.DataFrame(products_list)


# ─────────────────────────────────────────────
# 5. CHART HELPERS  (Matplotlib + Plotly)
# ─────────────────────────────────────────────
CHART_BG   = "#1e1608"
CHART_TEXT = "#d4c4a8"
CHART_ACCENT = ["#c87941","#e8a85a","#f5d78e","#8b5e2a","#6b4010","#d4956a"]
PLT_PARAMS = dict(facecolor=CHART_BG, edgecolor="none")

def monthly_revenue_chart(df):
    monthly = (df.groupby("month_order")["total_amount"]
                 .sum()
                 .reset_index()
                 .sort_values("month_order"))
    monthly["label"] = monthly["month_order"].dt.strftime("%b %Y")

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=monthly["label"], y=monthly["total_amount"],
        marker_color=CHART_ACCENT[0],
        marker_line_color=CHART_ACCENT[1],
        marker_line_width=1.2,
        opacity=0.9,
        name="Revenue"
    ))
    # Trend line
    fig.add_trace(go.Scatter(
        x=monthly["label"], y=monthly["total_amount"].rolling(2, min_periods=1).mean(),
        mode="lines+markers",
        line=dict(color=CHART_ACCENT[2], width=2.5, dash="dot"),
        marker=dict(size=6),
        name="Trend"
    ))
    fig.update_layout(
        paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font_color=CHART_TEXT,
        xaxis=dict(showgrid=False, color=CHART_TEXT),
        yaxis=dict(showgrid=True, gridcolor="#3d2e1a", color=CHART_TEXT,
                   tickprefix="₹", tickformat=",.0f"),
        legend=dict(bgcolor="rgba(0,0,0,0)", font_color=CHART_TEXT),
        margin=dict(l=10, r=10, t=10, b=10),
        height=320
    )
    return fig

def category_pie_chart(df):
    cat_rev = df.groupby("category")["total_amount"].sum().reset_index()
    fig = px.pie(cat_rev, values="total_amount", names="category",
                 color_discrete_sequence=CHART_ACCENT,
                 hole=0.45)
    fig.update_traces(textinfo="percent+label", textfont_color="#fff")
    fig.update_layout(
        paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font_color=CHART_TEXT,
        showlegend=True,
        legend=dict(bgcolor="rgba(0,0,0,0)", font_color=CHART_TEXT),
        margin=dict(l=10, r=10, t=10, b=10),
        height=320
    )
    return fig

def top_products_chart(df, n=10):
    top = (df.groupby("product_name")["total_amount"]
             .sum()
             .nlargest(n)
             .reset_index()
             .sort_values("total_amount"))
    fig = go.Figure(go.Bar(
        x=top["total_amount"], y=top["product_name"],
        orientation="h",
        marker=dict(
            color=top["total_amount"],
            colorscale=[[0,"#3d2200"],[0.5,"#c87941"],[1,"#f5d78e"]],
            showscale=False
        )
    ))
    fig.update_layout(
        paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font_color=CHART_TEXT,
        xaxis=dict(showgrid=True, gridcolor="#3d2e1a",
                   tickprefix="₹", tickformat=",.0f", color=CHART_TEXT),
        yaxis=dict(showgrid=False, color=CHART_TEXT),
        margin=dict(l=10, r=10, t=10, b=10),
        height=360
    )
    return fig

def payment_mode_chart(df):
    pay = df.groupby("payment")["total_amount"].sum().reset_index()
    fig = px.bar(pay, x="payment", y="total_amount",
                 color="payment",
                 color_discrete_sequence=CHART_ACCENT)
    fig.update_layout(
        paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font_color=CHART_TEXT, showlegend=False,
        xaxis=dict(showgrid=False, color=CHART_TEXT),
        yaxis=dict(showgrid=True, gridcolor="#3d2e1a",
                   tickprefix="₹", tickformat=",.0f", color=CHART_TEXT),
        margin=dict(l=10, r=10, t=10, b=10),
        height=280
    )
    return fig

def project_chart(df):
    proj = (df.groupby("project")["total_amount"]
              .sum()
              .reset_index()
              .sort_values("total_amount", ascending=False)
              .head(8))
    fig = px.bar(proj, x="project", y="total_amount",
                 color="total_amount",
                 color_continuous_scale=["#3d2200","#c87941","#f5d78e"])
    fig.update_coloraxes(showscale=False)
    fig.update_layout(
        paper_bgcolor=CHART_BG, plot_bgcolor=CHART_BG,
        font_color=CHART_TEXT,
        xaxis=dict(showgrid=False, color=CHART_TEXT, tickangle=-30),
        yaxis=dict(showgrid=True, gridcolor="#3d2e1a",
                   tickprefix="₹", tickformat=",.0f", color=CHART_TEXT),
        margin=dict(l=10, r=10, t=10, b=60),
        height=300
    )
    return fig


# ─────────────────────────────────────────────
# 6. SIDEBAR — navigation + business branding
# ─────────────────────────────────────────────

with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 12px 0 20px 0;">
      <div style="font-size:2.8rem;">🪵</div>
      <div class="logo-text">PlywoodPro</div>
      <div class="logo-sub">Business Intelligence</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    page = st.radio(
        "Navigate",
        ["📊  Dashboard", "➕  Add Sale", "📦  Products", "📁  All Sales", "⚙️  Settings"],
        label_visibility="collapsed"
    )

    st.markdown("---")
    # Quick date filter (affects Dashboard page)
    st.markdown("**Date Filter**")
    filter_months = st.selectbox(
        "Show last",
        ["All time", "1 Month", "3 Months", "6 Months", "12 Months"],
        index=3
    )
    st.markdown("---")
    st.markdown("""
    <div style="font-size:0.72rem; color:#6b5030; text-align:center;">
      Built for your father's business 🙏<br>
      Data saved locally on this machine
    </div>
    """, unsafe_allow_html=True)


# ─────────────────────────────────────────────
# 7. LOAD DATA INTO SESSION STATE
#    Session state acts like a cache between reruns
# ─────────────────────────────────────────────
if "products" not in st.session_state:
    st.session_state.products = load_products()
if "sales" not in st.session_state:
    st.session_state.sales = load_sales()

products = st.session_state.products
sales    = st.session_state.sales
df_sales = get_sales_df(sales)
df_prods = get_products_df(products)

# Apply sidebar date filter
def apply_date_filter(df, choice):
    if choice == "All time" or df.empty:
        return df
    n = {"1 Month":1, "3 Months":3, "6 Months":6, "12 Months":12}[choice]
    cutoff = pd.Timestamp.today() - pd.DateOffset(months=n)
    return df[df["date"] >= cutoff]

df_filtered = apply_date_filter(df_sales, filter_months)

CATEGORIES = ["Plywood","Doors","Cen Mica","Veneer","Decoratives","Hardware","Other"]
PAYMENT_MODES = ["Cash","UPI","Cheque","Credit","NEFT/RTGS"]
PROJECTS = ["Residential Flat","Office Renovation","Hotel Project","School Building",
            "Showroom Fit-out","Walk-in Wardrobe","Kitchen Cabinet",
            "Retail Store","Hospital Renovation","General","Other"]


# ══════════════════════════════════════════════
#  PAGE 1 — DASHBOARD
# ══════════════════════════════════════════════
if "Dashboard" in page:

    st.markdown("""
    <div class="hero-banner">
      <div class="hero-title">🪵 Sales Intelligence Dashboard</div>
      <div class="hero-sub">Real-time overview of your plywood & wood products business</div>
    </div>
    """, unsafe_allow_html=True)

    if df_filtered.empty:
        st.warning("No sales data for this period. Add some sales first!")
    else:
        # ── KPI Metrics ──────────────────────────────
        total_rev  = df_filtered["total_amount"].sum()
        total_qty  = df_filtered["qty"].sum()
        total_tx   = len(df_filtered)
        avg_order  = total_rev / total_tx if total_tx else 0

        k1, k2, k3, k4 = st.columns(4)
        k1.metric("💰 Total Revenue",   f"₹{total_rev:,.0f}")
        k2.metric("📦 Units Sold",       f"{total_qty:,}")
        k3.metric("🧾 Transactions",     f"{total_tx}")
        k4.metric("📈 Avg Order Value",  f"₹{avg_order:,.0f}")

        st.markdown('<div class="section-header">📅 Monthly Revenue & Trend</div>',
                    unsafe_allow_html=True)
        st.plotly_chart(monthly_revenue_chart(df_filtered), use_container_width=True)

        col1, col2 = st.columns(2)
        with col1:
            st.markdown('<div class="section-header">🏆 Top Products by Revenue</div>',
                        unsafe_allow_html=True)
            st.plotly_chart(top_products_chart(df_filtered), use_container_width=True)
        with col2:
            st.markdown('<div class="section-header">🥧 Revenue by Category</div>',
                        unsafe_allow_html=True)
            st.plotly_chart(category_pie_chart(df_filtered), use_container_width=True)

        col3, col4 = st.columns(2)
        with col3:
            st.markdown('<div class="section-header">🏗️ Revenue by Project Type</div>',
                        unsafe_allow_html=True)
            st.plotly_chart(project_chart(df_filtered), use_container_width=True)
        with col4:
            st.markdown('<div class="section-header">💳 Payment Mode Breakdown</div>',
                        unsafe_allow_html=True)
            st.plotly_chart(payment_mode_chart(df_filtered), use_container_width=True)

        # ── Category table ───────────────────────────
        st.markdown('<div class="section-header">📊 Category Summary</div>',
                    unsafe_allow_html=True)
        cat_summary = (df_filtered
                       .groupby("category")
                       .agg(Transactions=("sale_id","count"),
                            Units_Sold=("qty","sum"),
                            Total_Revenue=("total_amount","sum"),
                            Avg_Order=("total_amount","mean"))
                       .reset_index()
                       .sort_values("Total_Revenue", ascending=False))
        cat_summary["Total_Revenue"] = cat_summary["Total_Revenue"].map("₹{:,.0f}".format)
        cat_summary["Avg_Order"]     = cat_summary["Avg_Order"].map("₹{:,.0f}".format)
        st.dataframe(cat_summary, use_container_width=True, hide_index=True)


# ══════════════════════════════════════════════
#  PAGE 2 — ADD SALE
# ══════════════════════════════════════════════
elif "Add Sale" in page:

    st.markdown("""
    <div class="hero-banner">
      <div class="hero-title">➕ Record New Sale</div>
      <div class="hero-sub">Enter the sale details below — all fields marked * are required</div>
    </div>
    """, unsafe_allow_html=True)

    # ── Step 1: Choose category then product ─────
    st.markdown('<div class="section-header">Step 1 — Select Product</div>',
                unsafe_allow_html=True)

    c1, c2 = st.columns(2)
    with c1:
        sel_cat = st.selectbox("Category *", CATEGORIES)
    with c2:
        # Filter products by selected category
        cat_prods = [p for p in products if p["category"] == sel_cat]
        if cat_prods:
            prod_names = [p["name"] for p in cat_prods]
            sel_prod_name = st.selectbox("Product *", prod_names)
            sel_prod = next(p for p in cat_prods if p["name"] == sel_prod_name)
        else:
            st.info("No products in this category yet. Add them in Products page.")
            sel_prod = None

    if sel_prod:
        st.markdown(f"""
        <div class="card" style="background:#1a1208;">
          <span style="color:#a89070;">Size:</span> <b>{sel_prod['size']}</b> &nbsp;|&nbsp;
          <span style="color:#a89070;">Thickness:</span> <b>{sel_prod['thickness']}</b> &nbsp;|&nbsp;
          <span style="color:#a89070;">Unit:</span> <b>{sel_prod['unit']}</b> &nbsp;|&nbsp;
          <span style="color:#a89070;">Base Price:</span> <b style="color:#f5d78e;">₹{sel_prod['base_price']:,}</b>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('<div class="section-header">Step 2 — Quantity & Pricing</div>',
                unsafe_allow_html=True)
    c3, c4, c5 = st.columns(3)
    with c3:
        qty = st.number_input("Quantity *", min_value=1, value=1, step=1)
    with c4:
        default_price = sel_prod["base_price"] if sel_prod else 0.0
        unit_price = st.number_input("Unit Price (₹) *", min_value=0.0,
                                      value=float(default_price), step=50.0)
    with c5:
        disc = st.number_input("Discount (%)", min_value=0.0, max_value=50.0, value=0.0, step=0.5)

    total = qty * unit_price * (1 - disc/100)
    st.markdown(f"""
    <div style="background:#2a1500; border:1px solid #c87941; border-radius:10px;
                padding:12px 20px; margin:8px 0;">
      Total Amount: <span style="font-size:1.4rem; color:#f5d78e; font-weight:700;">
      ₹{total:,.2f}</span>
      {"&nbsp;&nbsp;(discount: ₹" + f"{qty*unit_price*disc/100:,.2f})" if disc>0 else ""}
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-header">Step 3 — Customer & Project</div>',
                unsafe_allow_html=True)
    c6, c7, c8 = st.columns(3)
    with c6:
        customer = st.text_input("Customer Name")
    with c7:
        project = st.selectbox("Project Type", PROJECTS)
    with c8:
        payment = st.selectbox("Payment Mode *", PAYMENT_MODES)

    c9, c10 = st.columns([1,2])
    with c9:
        sale_date = st.date_input("Sale Date *", value=date.today())
    with c10:
        note = st.text_input("Note (optional)")

    if st.button("💾 Save Sale", use_container_width=True):
        if sel_prod is None:
            st.error("Please select a valid product.")
        elif unit_price <= 0:
            st.error("Unit price must be > 0.")
        else:
            new_id = f"S{1000 + len(sales)}"
            new_sale = {
                "sale_id":     new_id,
                "date":        sale_date.strftime("%Y-%m-%d"),
                "product_id":  sel_prod["id"],
                "product_name":sel_prod["name"],
                "category":    sel_cat,
                "qty":         int(qty),
                "unit_price":  round(unit_price, 2),
                "discount_pct":round(disc, 2),
                "total_amount":round(total, 2),
                "customer":    customer or "Walk-in",
                "project":     project,
                "payment":     payment,
                "note":        note
            }
            sales.append(new_sale)
            save_sales(sales)
            st.session_state.sales = sales
            st.success(f"✅ Sale {new_id} saved! ₹{total:,.0f} recorded for {sel_prod['name']}")
            st.balloons()


# ══════════════════════════════════════════════
#  PAGE 3 — PRODUCTS CATALOG
# ══════════════════════════════════════════════
elif "Products" in page:

    st.markdown("""
    <div class="hero-banner">
      <div class="hero-title">📦 Product Catalog</div>
      <div class="hero-sub">Manage your plywood, doors, laminates, veneer & decoratives</div>
    </div>
    """, unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["📋 View Products", "➕ Add Product"])

    with tab1:
        cat_filter = st.selectbox("Filter by Category", ["All"] + CATEGORIES)
        if cat_filter == "All":
            display_prods = products
        else:
            display_prods = [p for p in products if p["category"] == cat_filter]

        if display_prods:
            pdf = pd.DataFrame(display_prods)
            pdf["base_price"] = pdf["base_price"].map("₹{:,}".format)
            st.dataframe(
                pdf[["id","name","category","size","thickness","unit","base_price"]],
                use_container_width=True, hide_index=True
            )
            st.caption(f"Showing {len(display_prods)} products")
        else:
            st.info("No products in this category yet.")

    with tab2:
        st.markdown('<div class="section-header">Add New Product</div>',
                    unsafe_allow_html=True)
        a1, a2 = st.columns(2)
        with a1:
            new_name = st.text_input("Product Name *")
            new_cat  = st.selectbox("Category *", CATEGORIES, key="new_cat")
            new_size = st.text_input("Size (e.g. 8x4 ft)", value="8x4 ft")
        with a2:
            new_thick = st.text_input("Thickness (e.g. 18mm)", value="-")
            new_unit  = st.selectbox("Unit", ["sheet","piece","mtr","ft","packet","sq ft","kg"])
            new_price = st.number_input("Base Price (₹) *", min_value=0.0, step=50.0)

        if st.button("➕ Add Product", use_container_width=True):
            if not new_name or new_price <= 0:
                st.error("Product name and price are required.")
            else:
                existing_ids = [p["id"] for p in products]
                prefix = new_cat[:2].upper()
                num = sum(1 for p in products if p["category"] == new_cat) + 1
                new_pid = f"{prefix}{num:03d}"
                while new_pid in existing_ids:
                    num += 1
                    new_pid = f"{prefix}{num:03d}"

                new_prod = {
                    "id":         new_pid,
                    "name":       new_name,
                    "category":   new_cat,
                    "size":       new_size,
                    "thickness":  new_thick,
                    "unit":       new_unit,
                    "base_price": round(new_price, 2)
                }
                products.append(new_prod)
                save_products(products)
                st.session_state.products = products
                st.success(f"✅ '{new_name}' added with ID {new_pid}!")
                st.rerun()


# ══════════════════════════════════════════════
#  PAGE 4 — ALL SALES TABLE
# ══════════════════════════════════════════════
elif "All Sales" in page:

    st.markdown("""
    <div class="hero-banner">
      <div class="hero-title">📁 All Sales Records</div>
      <div class="hero-sub">Browse, filter, and export your complete sales history</div>
    </div>
    """, unsafe_allow_html=True)

    if df_sales.empty:
        st.info("No sales recorded yet.")
    else:
        # Filters
        fc1, fc2, fc3 = st.columns(3)
        with fc1:
            f_cat = st.multiselect("Category", df_sales["category"].unique().tolist())
        with fc2:
            f_proj = st.multiselect("Project", df_sales["project"].unique().tolist())
        with fc3:
            f_pay = st.multiselect("Payment", df_sales["payment"].unique().tolist())

        filtered = df_sales.copy()
        if f_cat:  filtered = filtered[filtered["category"].isin(f_cat)]
        if f_proj: filtered = filtered[filtered["project"].isin(f_proj)]
        if f_pay:  filtered = filtered[filtered["payment"].isin(f_pay)]

        # Summary
        s1, s2, s3 = st.columns(3)
        s1.metric("Records", len(filtered))
        s2.metric("Total Revenue", f"₹{filtered['total_amount'].sum():,.0f}")
        s3.metric("Total Units",   f"{filtered['qty'].sum():,}")

        # Display
        display_cols = ["date","product_name","category","qty","unit_price",
                        "discount_pct","total_amount","customer","project","payment"]
        show_df = filtered[display_cols].copy()
        show_df["date"]         = show_df["date"].dt.strftime("%d %b %Y")
        show_df["unit_price"]   = show_df["unit_price"].map("₹{:,.0f}".format)
        show_df["total_amount"] = show_df["total_amount"].map("₹{:,.0f}".format)
        show_df["discount_pct"] = show_df["discount_pct"].map("{:.0f}%".format)
        st.dataframe(show_df, use_container_width=True, hide_index=True)

        # Export
        csv_data = filtered.to_csv(index=False).encode("utf-8")
        st.download_button(
            "⬇️ Export to CSV",
            data=csv_data,
            file_name=f"plywood_sales_{date.today()}.csv",
            mime="text/csv"
        )


# ══════════════════════════════════════════════
#  PAGE 5 — SETTINGS
# ══════════════════════════════════════════════
elif "Settings" in page:

    st.markdown("""
    <div class="hero-banner">
      <div class="hero-title">⚙️ Business Settings</div>
      <div class="hero-sub">Configure your business name and manage data</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div class="section-header">🏪 Business Info</div>', unsafe_allow_html=True)
    biz_name  = st.text_input("Business Name", value="Sharma Plywood & Hardware")
    biz_owner = st.text_input("Owner Name",    value="")
    biz_city  = st.text_input("City",          value="Kota, Rajasthan")
    biz_phone = st.text_input("Phone",         value="")

    st.markdown('<div class="section-header">🗄️ Data Management</div>', unsafe_allow_html=True)
    col_a, col_b = st.columns(2)
    with col_a:
        if st.button("🔄 Reload Sample Data", use_container_width=True):
            st.session_state.sales = _gen_sample_sales()
            save_sales(st.session_state.sales)
            st.success("Sample data reloaded!")
    with col_b:
        if st.button("🔁 Reset Products to Default", use_container_width=True):
            st.session_state.products = DEFAULT_PRODUCTS
            save_products(DEFAULT_PRODUCTS)
            st.success("Products reset to default catalog!")

    st.markdown('<div class="section-header">📊 Data Stats</div>', unsafe_allow_html=True)
    st.info(f"📦 Total Products: **{len(products)}** | 🧾 Total Sales Records: **{len(sales)}**")
