const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;

export function DashboardCards({ analytics }) {
  const cards = [
    ["今日訂單", `${analytics.todayOrderCount} 筆`],
    ["今日營收", money(analytics.todayRevenue)],
    ["今日支出", money(analytics.todayExpense)],
    ["今日淨收入", money(analytics.todayNet)],
    ["店內現金", money(analytics.cashBalance)],
    ["銀行戶頭", money(analytics.bankBalance)],
    ["總資金", money(analytics.totalFunds)],
    ["本週營收", money(analytics.weeklyRevenue)],
    ["本月營收", money(analytics.monthlyRevenue)],
    ["庫存警告", `${analytics.lowStockCount} 項`],
    [`麵體（每份 ${analytics.noodleInventory?.servingWeight || 0}G）`, `${Number(analytics.noodleInventory?.quantity || 0).toLocaleString("zh-TW")} ${analytics.noodleInventory?.unit || "G"} · ≈${analytics.noodleInventory?.servings || 0}份`]
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
