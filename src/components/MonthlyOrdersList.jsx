const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;

const countItems = (order) =>
  order.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0) || 0;

export function MonthlyOrdersList({ orders }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
            Order History
          </p>
          <h2 className="mt-2 text-2xl font-medium text-zinc-50">近30天訂單紀錄</h2>
        </div>
        <span className="rounded-full border border-[#C6A96B]/20 bg-[#C6A96B]/10 px-4 py-2 text-sm font-medium text-[#C6A96B]">
          {orders.length} 筆
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto pr-1">
        {orders.length ? (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] items-center gap-3 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm"
              >
                <span className="font-medium text-zinc-200">{order.date}</span>
                <span className="text-zinc-400">{order.time}</span>
                <span className="font-semibold text-[#C6A96B]">
                  {formatCurrency(order.total)}
                </span>
                <span className="text-right text-zinc-500">{countItems(order)} 件</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1115] text-zinc-600">
            近30天尚無訂單
          </div>
        )}
      </div>
    </article>
  );
}
