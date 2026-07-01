import { DashboardCards } from "./DashboardCards.jsx";
import { MonthlyOrdersList } from "./MonthlyOrdersList.jsx";
import { DailyRevenueChart } from "./charts/DailyRevenueChart.jsx";
import { ProductDistributionChart } from "./charts/ProductDistributionChart.jsx";
import { ExpenseCategoryChart, ExpenseTrendChart, ModeRevenueChart } from "./charts/OperationsCharts.jsx";

const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;

export function AnalyticsPanel({ analytics, onResetData }) {
  return <section className="mx-auto w-full max-w-7xl pb-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-sm tracking-[0.2em] text-[#C6A96B]/75">OPERATIONS</p><h1 className="mt-1 text-4xl font-medium">營運統計</h1></div><button type="button" onClick={onResetData} className="min-h-12 rounded-full border border-red-400/20 bg-red-500/10 px-5 font-semibold text-red-200">清除營業資料</button></div>
    <DashboardCards analytics={analytics} />
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本週營收</p><p className="mt-2 text-3xl font-semibold">{money(analytics.weeklyRevenue)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本月淨收入</p><p className="mt-2 text-3xl font-semibold">{money(analytics.monthlyNet)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">年度支出</p><p className="mt-2 text-3xl font-semibold">{money(analytics.yearlyExpense)}</p></div></div>
    <div className="mt-6"><DailyRevenueChart data={analytics.dailyRevenue} /></div>
    <div className="mt-6"><ProductDistributionChart data={analytics.productDistribution} /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><ModeRevenueChart data={analytics.modeRevenue}/><ExpenseCategoryChart data={analytics.expenseCategories}/></div>
    <div className="mt-6"><ExpenseTrendChart data={analytics.expenseTrend}/></div>
    <div className="mt-6"><MonthlyOrdersList orders={analytics.monthlyOrders}/></div>
  </section>;
}
