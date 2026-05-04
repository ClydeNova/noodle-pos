import { MonthlyOrdersList } from "./MonthlyOrdersList.jsx";
import { DailyRevenueChart } from "./charts/DailyRevenueChart.jsx";
import { ProductDistributionChart } from "./charts/ProductDistributionChart.jsx";

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;

function RevenueCard({ label, value, detail }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
        {label}
      </p>
      <p className="mt-5 text-5xl font-semibold tracking-normal text-zinc-50">
        {formatCurrency(value)}
      </p>
      <p className="mt-4 text-sm font-medium text-zinc-400">{detail}</p>
    </article>
  );
}

export function AnalyticsPanel({ analytics, onResetData }) {
  return (
    <section className="mx-auto w-full max-w-7xl pb-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C6A96B]/75">
            Sales Analytics
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-normal text-zinc-50">
            營業報表
          </h1>
        </div>
        <button
          type="button"
          onClick={onResetData}
          className="rounded-full border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:border-red-300/40 hover:bg-red-500/15 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-200/30"
        >
          清除所有資料
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <RevenueCard
          label="今日營業額"
          value={analytics.todayRevenue}
          detail={`${analytics.todaySales.length} 筆銷售`}
        />
        <RevenueCard
          label="本週營業額"
          value={analytics.weeklyRevenue}
          detail="最近 7 天"
        />
        <RevenueCard
          label="本月營業額"
          value={analytics.monthlyRevenue}
          detail="本月累計"
        />
      </div>

      <div className="mt-6">
        <DailyRevenueChart data={analytics.dailyRevenue} />
      </div>

      <div className="mt-6">
        <ProductDistributionChart data={analytics.productDistribution} />
      </div>

      <div className="mt-6">
        <MonthlyOrdersList orders={analytics.monthlyOrders} />
      </div>
    </section>
  );
}
