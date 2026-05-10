import { useState } from "react";

const formatQuantity = (value) => Number(value || 0).toLocaleString("en-US");

export function InventoryPanel({ inventoryItems, onAddStock }) {
  const [inputs, setInputs] = useState({});

  const updateInput = (ingredientId, value) => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [ingredientId]: value
    }));
  };

  const submitStock = (ingredientId) => {
    onAddStock(ingredientId, inputs[ingredientId]);
    updateInput(ingredientId, "");
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
          手動入庫後會立即保存。結帳完成才會扣庫存，取消訂單會自動回補。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {inventoryItems.map((ingredient) => (
          <article
            key={ingredient.id}
            className="rounded-2xl border border-white/10 bg-[#1A1D23] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
          >
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#C6A96B]/75">
              {ingredient.unit}
            </p>
            <h2 className="mt-2 text-2xl font-medium text-zinc-50">{ingredient.name}</h2>
            <p className="mt-4 text-zinc-400">目前庫存</p>
            <p className="mt-1 text-4xl font-semibold text-zinc-50">
              {formatQuantity(ingredient.quantity)}
              <span className="ml-2 text-lg font-medium text-zinc-500">
                {ingredient.unit}
              </span>
            </p>

            <div className="mt-6 flex gap-3">
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={inputs[ingredient.id] || ""}
                onChange={(event) => updateInput(ingredient.id, event.target.value)}
                placeholder="+1000"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-lg font-medium text-zinc-50 outline-none transition placeholder:text-zinc-600 focus:border-[#C6A96B]/45 focus:ring-2 focus:ring-[#C6A96B]/20"
              />
              <button
                type="button"
                onClick={() => submitStock(ingredient.id)}
                className="rounded-2xl bg-[#C6A96B] px-5 py-3 font-semibold text-[#0F1115] transition hover:bg-[#d4bb7d] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/40"
              >
                入庫
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
