import { useState } from "react";

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US")}`;

const countItems = (order) =>
  order.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0) || 0;

const summarizeItems = (order) =>
  order.items
    ?.slice(0, 2)
    .map((item) => (item.qty > 1 ? `${item.name} x ${item.qty}` : item.name))
    .join("、") || "";

function OrderDetail({ order, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#C6A96B]/20 bg-[#111217] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">{order.date}</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-50">{order.time}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-[#C6A96B]/30 hover:bg-white/10"
          >
            關閉
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {order.items?.map((item) => (
            <li
              key={`${order.id}-${item.id}`}
              className="rounded-2xl border border-white/10 bg-[#1A1D23] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-100">{item.name}</p>
                  {item.type === "combo" && Array.isArray(item.items) ? (
                    <p className="mt-1 truncate text-sm text-zinc-500">
                      {item.items.map((component) => component.name).join(" + ")}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-100">x {item.qty}</p>
                  <p className="text-sm text-zinc-500">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-zinc-400">總計</span>
          <span className="text-3xl font-semibold text-[#C6A96B]">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TodayOrdersPanel({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <aside className="flex min-h-0 flex-col border-l border-white/10 bg-[#111217]">
      <header className="border-b border-white/10 px-6 py-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
          Today Orders
        </p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-medium tracking-normal text-zinc-50">
            今日訂單
          </h1>
          <span className="rounded-full border border-[#C6A96B]/20 bg-[#C6A96B]/10 px-4 py-2 text-sm font-medium text-[#C6A96B]">
            {orders.length} 筆
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {orders.length ? (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="w-full rounded-2xl border border-white/10 bg-[#1A1D23] px-4 py-4 text-left shadow-[0_12px_34px_rgba(0,0,0,0.18)] transition hover:border-[#C6A96B]/30 hover:bg-[#20242C] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-zinc-100">{order.time}</span>
                    <span className="text-xl font-semibold text-[#C6A96B]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm text-zinc-500">
                    <span>{countItems(order)} items</span>
                    <span className="truncate">{summarizeItems(order)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="max-w-44 text-lg font-medium leading-7 text-zinc-600">
              今日尚無訂單
            </p>
          </div>
        )}
      </div>

      <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </aside>
  );
}
