import { useState } from "react";

const formatQuantity = (value) => Number(value || 0).toLocaleString("en-US");

const formatSignedQuantity = (quantity, unit) => {
  const value = Number(quantity || 0);
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatQuantity(value)} ${unit}`;
};

export function InventoryPanel({
  inventoryItems,
  inventoryHistory,
  onAddStock,
  onAdjustStock,
  onSetSafeStock
}) {
  const [stockInputs, setStockInputs] = useState({});
  const [adjustInputs, setAdjustInputs] = useState({});
  const [safeStockInputs, setSafeStockInputs] = useState({});

  const updateStockInput = (ingredientId, value) => {
    setStockInputs((currentInputs) => ({
      ...currentInputs,
      [ingredientId]: value
    }));
  };

  const updateAdjustInput = (ingredientId, value) => {
    setAdjustInputs((currentInputs) => ({
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

  const submitAdjustment = (ingredient) => {
    const amount = Number(adjustInputs[ingredient.id]);

    if (!Number.isFinite(amount) || amount === 0) {
      return;
    }

    const nextQuantity = Math.max(0, Number(ingredient.quantity || 0) + amount);
    const confirmed = window.confirm(
      `確定要調整 ${ingredient.name}？\n目前：${formatQuantity(ingredient.quantity)} ${ingredient.unit}\n調整：${formatSignedQuantity(amount, ingredient.unit)}\n結果：${formatQuantity(nextQuantity)} ${ingredient.unit}`
    );

    if (!confirmed) {
      return;
    }

    onAdjustStock(ingredient.id, amount);
    updateAdjustInput(ingredient.id, "");
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
          支援入庫、庫存調整、安全庫存與操作紀錄。所有數量都會顯示單位。
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
                    <span className="ml-1 text-base text-zinc-500">{ingredient.unit}</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-[#0F1115] p-4">
                  <p className="text-sm text-zinc-400">安全庫存</p>
                  <p className="mt-1 text-3xl font-semibold text-[#C6A96B]">
                    {formatQuantity(ingredient.safeStock)}
                    <span className="ml-1 text-base text-zinc-500">{ingredient.unit}</span>
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
                  placeholder={`+1000 ${ingredient.unit}`}
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
                  inputMode="decimal"
                  value={adjustInputs[ingredient.id] || ""}
                  onChange={(event) => updateAdjustInput(ingredient.id, event.target.value)}
                  placeholder={`調整，例如 -300 ${ingredient.unit}`}
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-lg font-medium text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-[#C6A96B]/45 focus:ring-2 focus:ring-[#C6A96B]/20"
                />
                <button
                  type="button"
                  onClick={() => submitAdjustment(ingredient)}
                  className="min-h-12 rounded-2xl border border-[#C6A96B]/30 px-5 py-3 font-semibold text-[#C6A96B] transition hover:bg-[#C6A96B]/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/30"
                >
                  調整
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
                  placeholder={`安全庫存 ${ingredient.unit}`}
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-lg font-medium text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-[#C6A96B]/45 focus:ring-2 focus:ring-[#C6A96B]/20"
                />
                <button
                  type="button"
                  onClick={() => submitSafeStock(ingredient.id)}
                  className="min-h-12 rounded-2xl border border-white/10 px-5 py-3 font-semibold text-zinc-200 transition hover:border-[#C6A96B]/30 hover:bg-white/5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/30"
                >
                  設定
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <article className="mt-6 rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
              Inventory History
            </p>
            <h2 className="mt-2 text-2xl font-medium text-zinc-50">庫存紀錄</h2>
          </div>
          <span className="text-sm text-zinc-500">最新 300 筆</span>
        </div>

        <div className="max-h-96 overflow-y-auto pr-1">
          {inventoryHistory.length ? (
            <div className="space-y-2">
              {inventoryHistory.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[1fr_0.8fr_1.2fr_0.9fr_0.8fr] items-center gap-3 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-200">{record.date}</span>
                  <span className="text-zinc-400">{record.time}</span>
                  <span className="truncate text-zinc-200">{record.ingredientName}</span>
                  <span className="text-zinc-400">{record.action}</span>
                  <span
                    className={
                      Number(record.quantity) < 0
                        ? "text-right font-semibold text-red-300"
                        : "text-right font-semibold text-[#C6A96B]"
                    }
                  >
                    {formatSignedQuantity(record.quantity, record.unit)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1115] text-zinc-600">
              尚無庫存紀錄
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
