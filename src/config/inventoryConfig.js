export const NOODLE_PORTION_GRAMS = 200;

if (NOODLE_PORTION_GRAMS !== 200) {
  throw new Error("Invalid noodle serving weight. Must be 200G.");
}

export const calculateNoodleServings = (grams) =>
  Math.floor(Math.max(0, Number(grams || 0)) / NOODLE_PORTION_GRAMS);
