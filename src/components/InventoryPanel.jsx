import { useState } from "react";

const formatQuantity = (value) => Number(value || 0).toLocaleString("en-US");

export function InventoryPanel({ inventoryItems, onAddStock, onSetSafeStock }) {
  const [stockInputs, setStockInputs] = useState({});
  const [safeStockInputs, setSafeStockInputs] = useState({});

  const updateStockInput = (ingredientId, value) => {
    setStockInputs((currentInputs) => ({
      ...currentInputs,
      [ingredientId]: value
    }));
  };

  const updateSafeStockInput = (ingredientId, value) => {
    setSafeStockInputs((currentInputs) => ({
      ...currentInputs,
      [ingredientId]: value
    }));
  };

  const submitStock = (ingredientId) => {
    onAddStock(ingredientId, stockInputs[ingredientId]);
    updateStockInput(ingredientId, "");
  };

  const submitSafeStock = (ingredientId) => {
    onSetSafeStock(ingredientId, safeStockInputs[ingredientId]);
    updateSafeStockInput(ingredientId, "");
  };

  return (
    <section className="mx-auto w-full max-w-7xl pb-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C6A96B]/75">
          Inventory
        </p>
        <h1 className="mt-2 text-4xl font-medium tracking-normal text-zinc-50">
          庫存管理
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          入庫與安全庫存會即時保存。結帳完成自動扣庫存，取消訂單自動回補。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {inventoryItems.map((ingredient) => {
          const isLowStock =
            Number(ingredient.safeStock || 0) > 0 &&
            Number(ingredient.quantity || 0) <= Number(ingredient.safeStock || 0);

          return (
            <article
              key={ingredient.id}
              className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#C6A96B]/75">
                    {ingredient.unit}
                  </p>
                  <h2 className="mt-2 text-2xl font-medium text-zinc-50">
                    {ingredient.name}
                  </h2>
                </div>
                {isLowStock ? (
                  <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                    低庫存
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#0F1115] p-4">
                  <p className="text-sm text-zinc-400">目前庫存</p>
                  <p className="mt-1 text-3xl font-semibold text-zinc-50">
                    {formatQuantity(ingredient.quantity)}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#0F1115] p-4">
                  <p className="text-sm text-zinc-400">安全庫存</p>
                  <p className="mt-1 text-3xl font-semibold text-[#C6A96B]">
                    {formatQuantity(ingredient.safeStock)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={stockInputs[ingredient.id] || ""}
                  onChange={(event) => updateStockInput(ingredient.id, event.target.value)}
                  placeholder="+1000"
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-lg font-medium text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-[#C6A96B]/45 focus:ring-2 focus:ring-[#C6A96B]/20"
                />
                <button
                  type="button"
                  onClick={() => submitStock(ingredient.id)}
                  className="min-h-12 rounded-2xl bg-[#C6A96B] px-5 py-3 font-semibold text-[#0F1115] transition hover:bg-[#d4bb7d] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/40"
                >
                  入庫
                </button>
              </div>

              <div className="mt-3 flex gap-3">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={safeStockInputs[ingredient.id] || ""}
                  onChange={(event) =>
                    updateSafeStockInput(ingredient.id, event.target.value)
                  }
                  placeholder="安全庫存"
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-lg font-medium text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-[#C6A96B]/45 focus:ring-2 focus:ring-[#C6A96B]/20"
                />
                <button
                  type="button"
                  onClick={() => submitSafeStock(ingredient.id)}
                  className="min-h-12 rounded-2xl border border-[#C6A96B]/30 px-5 py-3 font-semibold text-[#C6A96B] transition hover:bg-[#C6A96B]/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/30"
                >
                  設定
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
