export const inventoryIngredients = [
  { id: "noodle", name: "麵體", unit: "G" },
  { id: "sauce_original", name: "麻醬", unit: "包" },
  { id: "sauce_spicy", name: "四川麻辣", unit: "包" },
  { id: "sauce_sour", name: "酸辣開胃", unit: "包" },
  { id: "greenBean", legacyId: "mung_bean", legacyDivisor: 700, name: "綠豆冰沙", unit: "杯" },
  { id: "blackTea", legacyId: "black_tea", name: "經選紅茶", unit: "杯" },
  { id: "winterMelon", legacyId: "winter_melon_tea", name: "冬瓜茶", unit: "杯" }
];

export const flavorOptions = [
  { id: "sauce_original", name: "經典麻醬" },
  { id: "sauce_spicy", name: "四川麻辣" },
  { id: "sauce_sour", name: "酸辣開胃" }
];

export const inventoryMapping = {
  noodle: { noodle: 200, sauce: 1 },
  greenBean: { greenBean: 1 },
  blackTea: { blackTea: 1 },
  winterMelon: { winterMelon: 1 },
  wholesale: { noodle: 200 },
  signatureCombo: { noodle: 200, sauce: 1, greenBean: 1 },
  classicComboA: { noodle: 200, sauce: 1, blackTea: 1 },
  classicComboB: { noodle: 200, sauce: 1, winterMelon: 1 }
};

export const legacyInventoryProductIds = {
  standard_cold_noodle: "noodle",
  mung_bean_smoothie: "greenBean",
  premium_black_tea: "blackTea",
  winter_melon_tea: "winterMelon",
  reseller_cold_noodle: "wholesale",
  combo_signature: "signatureCombo",
  combo_classic_a: "classicComboA",
  combo_classic_b: "classicComboB"
};
