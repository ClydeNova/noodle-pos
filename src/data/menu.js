import { orderModes, normalizeOrderMode, pricing } from "../config/pricing.js";
import { products } from "../config/products.js";
import { comboItems } from "./combos.js";

export const ORDER_MODES = orderModes;

export const menuCategories = [
  { id: "noodles", label: "涼麵" },
  { id: "sets", label: "套餐" },
  { id: "drinks", label: "飲品" },
  { id: "reseller", label: "寄賣批發" }
];

export const singleItems = products.map((product) => ({
  ...product,
  type: "single",
  needsSauce: Boolean(product.requiresFlavor)
}));

export const menuItems = [...singleItems, ...comboItems];

export const menuById = menuItems.reduce((index, item) => {
  index[item.id] = item;
  item.legacyIds?.forEach((legacyId) => { index[legacyId] = item; });
  return index;
}, {});

export const getProductPrice = (product, mode = "dineIn") => {
  const normalizedMode = normalizeOrderMode(mode);
  return Number(pricing[normalizedMode]?.[product?.pricingKey] || 0);
};

export const productRequiresSauce = (product) =>
  Boolean(product?.requiresFlavor || product?.items?.some((item) => menuById[item.id]?.requiresFlavor));
