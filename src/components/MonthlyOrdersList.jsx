const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;

const summarizeProducts = (order) =>
  order.items?.map((item) => `${item.name}${item.qty > 1 ? ` x ${item.qty}` : ""}`).join("、") || "-";

const summarizeFlavors = (order) => {
  const flavors = order.items?.map((item) => item.sauce?.name).filter(Boolean) || [];
  return flavors.length ? flavors.join("、") : "-";
};

const modeLabel = (mode) =>
  mode === "delivery" || mode === "wholesale" ? "外送" : "現場";

export function MonthlyOrdersList({ orders }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6">
      <div className="mb-5">
        <p className="text-sm tracking-[.2em] text-[#C6A96B]/75">ORDER HISTORY</p>
        <h2 className="mt-2 text-2xl font-medium">近 30 天訂單紀錄</h2>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 bg-[#1A1D23] text-zinc-400">
            <tr>
              {["日期", "時間", "模式", "商品", "口味", "付款", "金額", "狀態"].map((label) => (
                <th key={label} className="px-4 py-3 font-medium">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((sale) => {
              const cancelled = sale.status === "cancelled";
              return (
                <tr key={sale.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3">{sale.date}</td>
                  <td className="px-4 py-3 text-zinc-400">{sale.time}</td>
                  <td className="px-4 py-3">{modeLabel(sale.mode)}</td>
                  <td className="max-w-64 px-4 py-3">{summarizeProducts(sale)}</td>
                  <td className="px-4 py-3 text-[#C6A96B]">{summarizeFlavors(sale)}</td>
                  <td className="px-4 py-3">{sale.paymentMethod === "bank" ? "匯款" : "現金"}</td>
                  <td className={`px-4 py-3 font-semibold ${cancelled ? "text-zinc-500 line-through" : "text-[#C6A96B]"}`}>{money(sale.total)}</td>
                  <td className={`px-4 py-3 ${cancelled ? "text-red-300" : "text-zinc-400"}`}>{cancelled ? "已取消" : "已完成"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders.length ? <div className="p-10 text-center text-zinc-500">尚無訂單紀錄</div> : null}
      </div>
    </article>
  );
}
