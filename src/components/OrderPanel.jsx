export function OrderPanel({ items, total, itemCount, onRemoveOne, onCheckout }) {
  const hasItems = items.length > 0;

  return (
    <aside className="flex min-h-0 flex-col border-l border-white/10 bg-[#111217]">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
              Current Order
            </p>
            <h1 className="mt-1 text-3xl font-medium tracking-normal text-zinc-50">
              點餐
            </h1>
          </div>
          <div className="rounded-full border border-[#C6A96B]/20 bg-[#C6A96B]/10 px-4 py-2 text-sm font-medium text-[#C6A96B]">
            {itemCount} 件
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {hasItems ? (
          <ul className="space-y-3.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#1A1D23] px-4 py-4 shadow-[0_12px_34px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-medium text-zinc-50">
                      {item.name}
                    </p>
                    <div className="mt-1 space-y-1">
                      {item.sauce ? (
                        <p className="text-sm text-[#C6A96B]">{item.sauce.name}</p>
                      ) : null}
                      {item.type === "combo" ? (
                        <p className="truncate text-sm text-zinc-400">
                          {item.items.map((component) => component.name).join(" + ")}
                        </p>
                      ) : null}
                      <p className="text-sm text-zinc-500">
                        ${item.price} x {item.qty} = ${item.price * item.qty}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="min-w-10 text-center text-2xl font-semibold text-zinc-100">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveOne(item.id)}
                      className="h-14 w-14 rounded-full border border-white/10 bg-[#0F1115] text-lg font-semibold text-zinc-100 transition hover:border-[#C6A96B]/35 hover:bg-[#242832] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/40"
                      aria-label={`Remove one ${item.name}`}
                    >
                      -1
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <p className="max-w-44 text-lg font-medium leading-7 text-zinc-600">
              尚未加入品項
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-white/10 bg-[#0F1115] px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-medium text-zinc-400">總計</span>
          <span className="text-4xl font-semibold tracking-normal text-zinc-50">
            ${total}
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={!hasItems}
          className="h-16 w-full rounded-2xl bg-[#C6A96B] text-xl font-semibold text-[#0F1115] shadow-[0_0_32px_rgba(198,169,107,0.2)] transition hover:bg-[#d4bb7d] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#2B2F38] disabled:text-zinc-600 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/50"
        >
          結帳
        </button>
      </footer>
    </aside>
  );
}
