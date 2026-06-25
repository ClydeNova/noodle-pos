import { useState } from "react";
import { sauceOptions } from "../data/ingredients.js";

const buildComboItems = (product, upgradeNoodle) =>
  product.items.map((item) =>
    item.id === "standard_cold_noodle" && upgradeNoodle
      ? { id: "deluxe_cold_noodle", name: "大滿足涼麵", qty: item.qty }
      : item
  );

export function ComboCustomizationModal({ product, onConfirm, onClose }) {
  const [upgradeNoodle, setUpgradeNoodle] = useState(false);
  const [selectedSauce, setSelectedSauce] = useState(null);

  if (!product) {
    return null;
  }

  const finalPrice = product.price + (upgradeNoodle ? 5 : 0);
  const finalItems = buildComboItems(product, upgradeNoodle);

  const confirm = () => {
    if (!selectedSauce) {
      window.alert("請選擇醬包");
      return;
    }

    onConfirm({
      sauce: selectedSauce,
      upgradeNoodle,
      items: finalItems,
      priceAdjustment: upgradeNoodle ? 5 : 0
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#C6A96B]/20 bg-[#111217] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
            Combo
          </p>
          <h2 className="mt-2 text-3xl font-medium text-zinc-50">{product.name}</h2>
          <p className="mt-2 text-sm text-zinc-400">
            套餐價格 ${finalPrice}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1A1D23] p-4">
          <p className="text-sm font-medium text-zinc-400">Option 1 / 麵量</p>
          <label className="mt-3 flex min-h-14 items-center gap-3 rounded-2xl bg-[#0F1115] px-4 py-3 text-zinc-100">
            <input
              type="checkbox"
              checked={upgradeNoodle}
              onChange={(event) => setUpgradeNoodle(event.target.checked)}
              className="h-5 w-5 accent-[#C6A96B]"
            />
            <span className="text-lg font-medium">+5 元升級大滿足涼麵</span>
          </label>
          <div className="mt-3 text-sm text-zinc-500">
            {finalItems.map((item) => item.name).join(" + ")}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#1A1D23] p-4">
          <p className="text-sm font-medium text-zinc-400">Option 2 / 醬包</p>
          <div className="mt-3 grid gap-3">
            {sauceOptions.map((sauce) => {
              const active = selectedSauce?.id === sauce.id;

              return (
                <button
                  key={sauce.id}
                  type="button"
                  onClick={() => setSelectedSauce(sauce)}
                  className={[
                    "min-h-14 rounded-2xl border px-5 py-4 text-left text-lg font-medium transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/35",
                    active
                      ? "border-[#C6A96B] bg-[#C6A96B] text-[#0F1115]"
                      : "border-white/10 bg-[#0F1115] text-zinc-50 hover:border-[#C6A96B]/35"
                  ].join(" ")}
                >
                  {sauce.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-[#C6A96B]/30 hover:bg-white/10"
          >
            取消
          </button>
          <button
            type="button"
            onClick={confirm}
            className="min-h-12 rounded-full bg-[#C6A96B] px-5 py-3 text-sm font-semibold text-[#0F1115] transition hover:bg-[#d4bb7d] active:scale-[0.98]"
          >
            加入訂單
          </button>
        </div>
      </div>
    </div>
  );
}
