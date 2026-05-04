export function ProductButton({ product, onAddItem }) {
  const isCombo = product.type === "combo";
  const comboDescription = product.items
    ?.map((item) => (item.qty > 1 ? `${item.name} x ${item.qty}` : item.name))
    .join(" + ");

  return (
    <button
      type="button"
      onClick={() => onAddItem(product)}
      className="group flex min-h-44 flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#20242C] via-[#1A1D23] to-[#111217] p-6 text-left shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#C6A96B]/35 hover:from-[#252A33] active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/40"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-[#C6A96B]/20 bg-[#C6A96B]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#C6A96B]">
            {isCombo ? "Set" : "Item"}
          </span>
          {isCombo ? (
            <span className="rounded-full bg-[#C6A96B] px-3 py-1 text-xs font-semibold text-[#0F1115]">
              套餐
            </span>
          ) : null}
        </div>
        <h2 className="text-4xl font-medium tracking-normal text-zinc-50">
          {product.name}
        </h2>
        {isCombo ? (
          <p className="mt-3 text-base font-medium leading-6 text-zinc-400">
            {comboDescription}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-normal text-[#C6A96B]">
          ${product.price}
        </span>
        <span className="text-sm font-medium text-zinc-500 transition group-hover:text-zinc-300">
          Tap
        </span>
      </div>
    </button>
  );
}
