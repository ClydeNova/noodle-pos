# Noodle Shop POS

Frontend-only React POS MVP for a cold noodle shop. Product pricing is centralized, combos are first-class order items, active orders persist locally, and completed checkouts are appended to localStorage under `sales`.

## Run

```bash
npm install
npm run dev
```

## Tailwind Setup

Tailwind is already wired through:

- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css`

For a fresh project:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then add:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Structure

- `src/App.jsx`: App composition, view switching, checkout, and reset flow
- `src/data/menu.js`: Single source of truth for single products, prices, categories
- `src/data/combos.js`: Combo product definitions
- `src/hooks/useOrder.js`: Unified cart logic for singles and combos
- `src/hooks/useSales.js`: Sales recording with local date/time fields in localStorage `sales`
- `src/hooks/useAnalytics.js`: Revenue summaries, daily revenue grouping, and product mix aggregation
- `src/hooks/usePosIntegrations.js`: Future inventory, Firebase sync, daily sales hooks
- `src/components/Layout.jsx`: Fixed brand header and scrollable content shell
- `src/components/ProductButton.jsx`: Touch-friendly product/combo button
- `src/components/ProductGrid.jsx`: Category-grouped POS menu
- `src/components/OrderPanel.jsx`: Cart, quantity removal, subtotal, checkout
- `src/components/TodayOrdersPanel.jsx`: Real-time list of today's completed orders
- `src/components/AnalyticsPanel.jsx`: Analytics layout and data reset action
- `src/components/MonthlyOrdersList.jsx`: Scrollable last-30-days order history
- `src/components/charts/DailyRevenueChart.jsx`: Revenue per day chart
- `src/components/charts/ProductDistributionChart.jsx`: Product sales distribution chart
