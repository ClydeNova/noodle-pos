export const ingredients = [
  { id: "noodle", name: "涼麵麵體", unit: "g" },
  { id: "sauce_original", name: "經典麻醬醬包", unit: "包" },
  { id: "sauce_spicy", name: "四川麻辣醬包", unit: "包" },
  { id: "sauce_sour", name: "酸辣開胃醬包", unit: "包" },
  { id: "mung_bean", name: "綠豆冰沙", unit: "cc" },
  { id: "black_tea", name: "經選紅茶", unit: "杯" },
  { id: "winter_melon_tea", name: "冬瓜茶", unit: "杯" }
];

export const sauceOptions = [
  { id: "sauce_original", name: "經典麻醬" },
  { id: "sauce_spicy", name: "四川麻辣" },
  { id: "sauce_sour", name: "酸辣開胃" }
];

export const productInventoryUsage = {
  standard_cold_noodle: { noodle: 200, sauce: 1 },
  reseller_cold_noodle: { noodle: 200 },
  premium_black_tea: { black_tea: 1 },
  winter_melon_tea: { winter_melon_tea: 1 },
  mung_bean_smoothie: { mung_bean: 700 }
};
