import { combos } from "../config/combos.js";
import { products } from "../config/products.js";

const productsById = Object.fromEntries(products.map((product) => [product.id, product]));

export const comboItems = combos.map((combo) => ({
  ...combo,
  category: "sets",
  type: "combo",
  items: combo.items.map((productId) => ({
    id: productId,
    name: productsById[productId].name,
    qty: 1
  }))
}));
