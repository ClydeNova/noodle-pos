import { sauceOptions } from "../data/ingredients.js";

export function SauceSelectionModal({ product, onSelect, onClose }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#C6A96B]/20 bg-[#111217] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C6A96B]/75">
            Sauce
          </p>
          <h2 className="mt-2 text-3xl font-medium text-zinc-50">選擇醬包</h2>
          <p className="mt-2 text-sm text-zinc-400">{product.name}</p>
        </div>

        <div className="grid gap-3">
          {sauceOptions.map((sauce) => (
            <button
              key={sauce.id}
              type="button"
              onClick={() => onSelect(sauce)}
              className="rounded-2xl border border-white/10 bg-[#1A1D23] px-5 py-5 text-left text-xl font-medium text-zinc-50 transition hover:border-[#C6A96B]/35 hover:bg-[#20242C] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/35"
            >
              {sauce.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-[#C6A96B]/30 hover:bg-white/10"
        >
          取消
        </button>
      </div>
    </div>
  );
}
