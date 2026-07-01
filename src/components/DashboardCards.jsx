const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;

export function DashboardCards({ analytics }) {
  const cards = [
    ["今日訂單", `${analytics.todayOrderCount} 筆`],
    ["今日營收", money(analytics.todayRevenue)],
    ["今日支出", money(analytics.todayExpense)],
    ["今日淨收入", money(analytics.todayNet)],
    ["本週營收", money(analytics.weeklyRevenue)],
    ["本月營收", money(analytics.monthlyRevenue)],
    ["庫存警告", `${analytics.lowStockCount} 項`]
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-2xl border border-white/10 bg-[#1A1D23] p-5 shadow-lg">
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">{value}</p>
        </article>
      ))}
    </div>
  );
}
