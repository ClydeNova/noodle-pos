import { sauceOptions } from "../data/ingredients.js";

export function SauceSelectionModal({ product, onSelect, onClose }) {
  if (!product) return null;
  return <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-[#C6A96B]/20 bg-[#111217] p-6 shadow-2xl"><p className="text-sm tracking-[0.2em] text-[#C6A96B]/75">口味選擇</p><h2 className="mt-2 text-3xl font-medium">{product.name}</h2><p className="mt-2 text-sm text-zinc-400">請選擇一種口味才能加入訂單</p><div className="mt-6 grid gap-3">{sauceOptions.map((sauce) => <button key={sauce.id} type="button" onClick={() => onSelect(sauce)} className="min-h-16 rounded-2xl border border-white/10 bg-[#1A1D23] px-5 text-left text-xl font-medium transition hover:border-[#C6A96B]/35 active:scale-[0.99]">{sauce.name}</button>)}</div><button type="button" onClick={onClose} className="mt-5 min-h-12 w-full rounded-full border border-white/10 text-zinc-200">取消</button></div></div>;
}
