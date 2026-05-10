export const ingredients = [
  {
    id: "noodle",
    name: "涼麵麵體",
    unit: "g"
  },
  {
    id: "sauce_original",
    name: "原味醬包",
    unit: "包"
  },
  {
    id: "sauce_spicy",
    name: "辣味醬包",
    unit: "包"
  },
  {
    id: "sauce_sesame",
    name: "麻醬醬包",
    unit: "包"
  },
  {
    id: "black_tea",
    name: "紅茶",
    unit: "cc"
  },
  {
    id: "mung_bean",
    name: "綠豆湯",
    unit: "cc"
  }
];

export const sauceOptions = [
  { id: "sauce_original", name: "原味" },
  { id: "sauce_spicy", name: "辣味" },
  { id: "sauce_sesame", name: "麻醬" }
];

export const productInventoryUsage = {
  standard_cold_noodle: {
    noodle: 200,
    sauce: 1
  },
  deluxe_cold_noodle: {
    noodle: 300,
    sauce: 1
  },
  premium_black_tea: {
    black_tea: 700
  },
  mung_bean_smoothie: {
    mung_bean: 700
  }
};
