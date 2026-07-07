import { ORDER_MODES, menuCategories } from "../data/menu.js";
import { ProductButton } from "./ProductButton.jsx";

export function ProductGrid({ products, mode, onModeChange, onAddItem }) {
  const isDelivery = mode === "delivery";
  const groups = menuCategories.map((category) => ({ ...category, products: products.filter((product) => product.category === category.id) })).filter((group) => group.products.length);
  return (
    <section className="min-h-0 overflow-y-auto p-5 lg:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm tracking-[0.2em] text-[#C6A96B]/75">今日點餐</p><h1 className="mt-1 text-3xl font-medium">餐點選擇</h1></div>
        <div className="flex rounded-2xl border border-white/10 bg-[#111217] p-1">
          {Object.values(ORDER_MODES).map((item) => {
            const active = mode === item.id;
            const activeClass = item.id === "delivery"
              ? "border border-emerald-400 bg-emerald-500/10 text-emerald-400"
              : "border border-[#C6A96B] bg-[#C6A96B] text-[#0F1115]";
            return <button key={item.id} type="button" onClick={() => onModeChange(item.id)} className={`min-h-12 rounded-xl border border-transparent px-5 font-medium transition ${active ? activeClass : "text-zinc-400"}`}>{item.label}</button>;
          })}
        </div>
      </div>
      <div className="space-y-7">{groups.map((group) => <div key={group.id}><div className="mb-3 flex items-center gap-4"><h2 className="text-lg font-medium text-zinc-200">{group.label}</h2><div className={`h-px flex-1 ${isDelivery ? "bg-emerald-400/20" : "bg-[#C6A96B]/15"}`} /></div><div className="grid grid-cols-2 gap-4">{group.products.map((product) => <ProductButton key={product.id} product={product} mode={mode} onAddItem={onAddItem} />)}</div></div>)}</div>
    </section>
  );
}
