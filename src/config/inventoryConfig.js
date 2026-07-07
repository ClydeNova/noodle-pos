export const inventoryConfig = {
  noodleServingWeight: 200
};

if (inventoryConfig.noodleServingWeight !== 200) {
  throw new Error("Invalid noodle serving weight. Must be 200G.");
}

export const calculateNoodleServings = (grams) =>
  Math.floor(Math.max(0, Number(grams || 0)) / inventoryConfig.noodleServingWeight);
