import { comboItems } from "./combos.js";

export const menuCategories = [
  { id: "noodles", label: "涼麵" },
  { id: "sets", label: "套餐" },
  { id: "drinks", label: "飲品" },
  { id: "sides", label: "湯品" }
];

export const singleItems = [
  {
    id: "standard_cold_noodle",
    name: "標準涼麵",
    price: 60,
    category: "noodles",
    type: "single",
    needsSauce: true
  },
  {
    id: "deluxe_cold_noodle",
    name: "大滿足涼麵",
    price: 75,
    category: "noodles",
    type: "single",
    needsSauce: true
  },
  {
    id: "premium_black_tea",
    name: "經選紅茶",
    price: 30,
    category: "drinks",
    type: "single"
  },
  {
    id: "winter_melon_tea",
    name: "冬瓜茶",
    price: 30,
    category: "drinks",
    type: "single"
  },
  {
    id: "mung_bean_smoothie",
    name: "綠豆冰沙",
    price: 50,
    category: "drinks",
    type: "single"
  },
  {
    id: "miso_soup",
    name: "味噌湯",
    price: 50,
    category: "sides",
    type: "single"
  }
];

export const menuItems = [...singleItems, ...comboItems];

export const menuById = Object.fromEntries(menuItems.map((item) => [item.id, item]));

export const productRequiresSauce = (product) =>
  Boolean(
    product?.needsSauce ||
      product?.items?.some((item) => menuById[item.id]?.needsSauce)
  );
