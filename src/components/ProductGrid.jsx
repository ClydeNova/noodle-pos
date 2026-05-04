import { menuCategories } from "../data/menu.js";
import { ProductButton } from "./ProductButton.jsx";

export function ProductGrid({ products, onAddItem }) {
  const groupedProducts = menuCategories
    .map((category) => ({
      ...category,
      products: products.filter((product) => product.category === category.id)
    }))
    .filter((category) => category.products.length > 0);

  return (
    <section className="min-h-0 overflow-y-auto p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#C6A96B]/75">
          Hiyashi Noodle POS
        </p>
        <h1 className="mt-2 text-4xl font-medium tracking-normal text-zinc-50">
          今日菜單
        </h1>
      </div>

      <div className="space-y-8">
        {groupedProducts.map((category) => (
          <div key={category.id}>
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-lg font-medium text-zinc-200">{category.label}</h2>
              <div className="h-px flex-1 bg-[#C6A96B]/15" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              {category.products.map((product) => (
                <ProductButton
                  key={product.id}
                  product={product}
                  onAddItem={onAddItem}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
