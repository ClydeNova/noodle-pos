import { NOODLE_PORTION_GRAMS } from "./inventoryConfig.js";

export const products = [
  {
    id: "noodle",
    legacyIds: ["standard_cold_noodle"],
    pricingKey: "noodle",
    name: "標準涼麵",
    size: NOODLE_PORTION_GRAMS,
    unit: "G",
    category: "noodles",
    requiresFlavor: true
  },
  {
    id: "greenBean",
    legacyIds: ["mung_bean_smoothie"],
    pricingKey: "greenBean",
    name: "綠豆冰沙",
    unit: "杯",
    category: "drinks"
  },
  {
    id: "blackTea",
    legacyIds: ["premium_black_tea"],
    pricingKey: "blackTea",
    name: "經選紅茶",
    unit: "杯",
    category: "drinks"
  },
  {
    id: "winterMelon",
    legacyIds: ["winter_melon_tea"],
    pricingKey: "winterMelon",
    name: "冬瓜茶",
    unit: "杯",
    category: "drinks"
  },
  {
    id: "wholesale",
    legacyIds: ["reseller_cold_noodle"],
    pricingKey: "wholesaleNoodle",
    name: "涼麵寄賣批發",
    unit: "份",
    category: "reseller",
    requiresFlavor: true
  }
];
