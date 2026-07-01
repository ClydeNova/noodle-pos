import { comboItems } from "./combos.js";

export const ORDER_MODES = {
  retail: { id: "retail", label: "零售模式", shortLabel: "零售" },
  wholesale: { id: "wholesale", label: "批發模式", shortLabel: "批發" }
};

export const menuCategories = [
  { id: "noodles", label: "涼麵" },
  { id: "sets", label: "套餐" },
  { id: "drinks", label: "飲品" }
];

export const singleItems = [
  {
    id: "standard_cold_noodle",
    name: "標準涼麵",
    prices: { retail: 60, wholesale: 75 },
    category: "noodles",
    type: "single",
    needsSauce: true
  },
  {
    id: "mung_bean_smoothie",
    name: "綠豆冰沙",
    prices: { retail: 50, wholesale: 65 },
    category: "drinks",
    type: "single"
  },
  {
    id: "premium_black_tea",
    name: "經選紅茶",
    prices: { retail: 30, wholesale: 40 },
    category: "drinks",
    type: "single"
  },
  {
    id: "winter_melon_tea",
    name: "冬瓜茶",
    prices: { retail: 30, wholesale: 40 },
    category: "drinks",
    type: "single"
  }
];

export const menuItems = [...singleItems, ...comboItems];
export const menuById = Object.fromEntries(menuItems.map((item) => [item.id, item]));

export const getProductPrice = (product, mode = "retail") =>
  Number(product?.prices?.[mode] ?? product?.prices?.retail ?? product?.price ?? 0);

export const productRequiresSauce = (product) =>
  Boolean(product?.needsSauce || product?.items?.some((item) => menuById[item.id]?.needsSauce));
