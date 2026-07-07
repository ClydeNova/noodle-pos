import { DashboardCards } from "./DashboardCards.jsx";
import { MonthlyOrdersList } from "./MonthlyOrdersList.jsx";
import { DailyRevenueChart } from "./charts/DailyRevenueChart.jsx";
import { ProductDistributionChart } from "./charts/ProductDistributionChart.jsx";
import { CashBalanceTrendChart, CashFlowChart, ExpenseCategoryChart, ExpenseTrendChart, LossDistributionChart, LossTrendChart, ModeRevenueChart } from "./charts/OperationsCharts.jsx";

const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;

export function AnalyticsPanel({ analytics, activeMode, onResetData }) {
  return <section className="mx-auto w-full max-w-7xl pb-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-sm tracking-[0.2em] text-[#C6A96B]/75">OPERATIONS</p><h1 className="mt-1 text-4xl font-medium">營運統計</h1><span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${activeMode === "delivery" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-400" : "border-[#C6A96B]/30 bg-[#C6A96B]/10 text-[#C6A96B]"}`}>{activeMode === "delivery" ? "外送模式" : "現場模式"}</span></div><button type="button" onClick={onResetData} className="min-h-12 rounded-full border border-red-400/20 bg-red-500/10 px-5 font-semibold text-red-200">清除營業資料</button></div>
    <DashboardCards analytics={analytics} />
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">今日現金收入</p><p className="mt-2 text-3xl font-semibold">{money(analytics.todayCashRevenue)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">今日匯款收入</p><p className="mt-2 text-3xl font-semibold">{money(analytics.todayBankRevenue)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">今日總收入</p><p className="mt-2 text-3xl font-semibold">{money(analytics.todayTotalIncome)}</p></div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">今日損耗</p><p className="mt-2 text-3xl font-semibold">{money(analytics.todayLossAmount)}</p><p className="mt-1 text-sm text-zinc-500">{analytics.todayLosses.length} 筆</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本週損耗</p><p className="mt-2 text-3xl font-semibold">{money(analytics.weeklyLossAmount)}</p><p className="mt-1 text-sm text-zinc-500">{analytics.weeklyLosses.length} 筆</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本月損耗</p><p className="mt-2 text-3xl font-semibold">{money(analytics.monthlyLossAmount)}</p><p className="mt-1 text-sm text-zinc-500">{analytics.monthlyLosses.length} 筆</p></div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本週營收</p><p className="mt-2 text-3xl font-semibold">{money(analytics.weeklyRevenue)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">本月淨收入</p><p className="mt-2 text-3xl font-semibold">{money(analytics.monthlyNet)}</p></div><div className="rounded-2xl bg-[#111217] p-5"><p className="text-zinc-400">年度支出</p><p className="mt-2 text-3xl font-semibold">{money(analytics.yearlyExpense)}</p></div></div>
    <div className="mt-6"><DailyRevenueChart data={analytics.dailyRevenue} /></div>
    <div className="mt-6"><ProductDistributionChart data={analytics.productDistribution} /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><ModeRevenueChart data={analytics.modeRevenue}/><ExpenseCategoryChart data={analytics.expenseCategories}/></div>
    <div className="mt-6"><ExpenseTrendChart data={analytics.expenseTrend}/></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><LossDistributionChart data={analytics.lossDistribution}/><LossTrendChart data={analytics.lossTrend}/></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><CashFlowChart inflow={analytics.cashInflow} outflow={analytics.cashOutflow}/><CashBalanceTrendChart data={analytics.cashTrend}/></div>
    <div className="mt-6"><MonthlyOrdersList orders={analytics.monthlyOrders}/></div>
  </section>;
}
