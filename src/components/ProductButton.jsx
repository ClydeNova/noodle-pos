import { getProductPrice } from "../data/menu.js";

export function ProductButton({ product, mode, onAddItem }) {
  const isCombo = product.type === "combo";
  const isDelivery = mode === "delivery";
  const price = getProductPrice(product, mode);
  return (
    <button type="button" onClick={() => onAddItem(product)}
      className={`group flex min-h-40 flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#20242C] via-[#1A1D23] to-[#111217] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 active:scale-[0.98] lg:min-h-44 lg:p-6 ${isDelivery ? "hover:border-emerald-400/40" : "hover:border-[#C6A96B]/35"}`}>
      <div>
        <span className={`text-xs font-medium tracking-[0.16em] ${isDelivery ? "text-emerald-400" : "text-[#C6A96B]"}`}>{isCombo ? "套餐" : "單品"}</span>
        <h2 className="mt-3 text-2xl font-medium text-zinc-50 lg:text-3xl">{product.name}</h2>
        {isCombo ? <p className="mt-2 text-sm leading-5 text-zinc-400">{product.items.map((item) => item.name).join(" + ")}</p> : null}
      </div>
      <span className={`mt-5 text-3xl font-semibold ${isDelivery ? "text-emerald-400" : "text-[#C6A96B]"}`}>${price}</span>
    </button>
  );
}
