export const inventoryConfig = {
  noodleServingWeight: 200
};

export const calculateNoodleServings = (grams) =>
  Math.floor(Math.max(0, Number(grams || 0)) / inventoryConfig.noodleServingWeight);
