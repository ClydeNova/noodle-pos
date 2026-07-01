export const DEFAULT_STORE_ID = "guoling-store";

export const pricing = {
  dineIn: {
    noodle: 60,
    greenBean: 50,
    blackTea: 30,
    winterMelon: 30,
    signatureCombo: 90,
    classicComboA: 70,
    classicComboB: 70,
    wholesaleNoodle: 50
  },
  delivery: {
    noodle: 75,
    greenBean: 65,
    blackTea: 40,
    winterMelon: 40,
    signatureCombo: 120,
    classicComboA: 90,
    classicComboB: 90,
    wholesaleNoodle: 50
  }
};

export const orderModes = {
  dineIn: { id: "dineIn", label: "現場模式", shortLabel: "現場" },
  delivery: { id: "delivery", label: "外送模式", shortLabel: "外送" }
};

export const normalizeOrderMode = (mode) =>
  mode === "delivery" || mode === "wholesale" ? "delivery" : "dineIn";
