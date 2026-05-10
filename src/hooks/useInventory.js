import { useCallback, useMemo, useState } from "react";
import { ingredients, productInventoryUsage } from "../data/ingredients.js";
import { menuById } from "../data/menu.js";

export const INVENTORY_STORAGE_KEY = "inventory";

const readInventory = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeInventory = (inventory) => {
  window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
};

const createInventoryRecord = (ingredient, quantity = 0) => ({
  ...ingredient,
  quantity: Number(quantity || 0)
});

const normalizeInventory = (storedInventory) =>
  Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      createInventoryRecord(ingredient, storedInventory[ingredient.id]?.quantity)
    ])
  );

const addUsage = (usage, ingredientId, amount) => {
  if (!ingredientId || !amount) {
    return;
  }

  usage[ingredientId] = (usage[ingredientId] || 0) + amount;
};

const applyProductUsage = (usage, productId, multiplier, sauce) => {
  const productUsage = productInventoryUsage[productId];

  if (!productUsage) {
    return;
  }

  Object.entries(productUsage).forEach(([ingredientId, amount]) => {
    if (ingredientId === "sauce") {
      addUsage(usage, sauce?.id, amount * multiplier);
      return;
    }

    addUsage(usage, ingredientId, amount * multiplier);
  });
};

export const calculateInventoryUsage = (orderItems) => {
  const usage = {};

  orderItems.forEach((lineItem) => {
    const lineQty = Number(lineItem.qty || 0);

    if (lineItem.type === "combo" && Array.isArray(lineItem.items)) {
      lineItem.items.forEach((comboItem) => {
        const componentProduct = menuById[comboItem.id];
        applyProductUsage(
          usage,
          comboItem.id,
          lineQty * Number(comboItem.qty || 1),
          componentProduct?.needsSauce ? lineItem.sauce : null
        );
      });
      return;
    }

    applyProductUsage(usage, lineItem.productId || lineItem.id, lineQty, lineItem.sauce);
  });

  return usage;
};

const buildShortages = (inventory, usage) =>
  Object.entries(usage)
    .map(([ingredientId, amount]) => {
      const record = inventory[ingredientId];
      const available = Number(record?.quantity || 0);

      if (available >= amount) {
        return null;
      }

      return {
        ingredientId,
        name: record?.name || ingredientId,
        unit: record?.unit || "",
        required: amount,
        available
      };
    })
    .filter(Boolean);

export function getInventory() {
  return normalizeInventory(readInventory());
}

export function useInventory() {
  const [inventory, setInventory] = useState(getInventory);

  const inventoryList = useMemo(() => Object.values(inventory), [inventory]);

  const addStock = useCallback((ingredientId, amount) => {
    const quantity = Number(amount);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    setInventory((currentInventory) => {
      const currentRecord = currentInventory[ingredientId];
      const nextInventory = {
        ...currentInventory,
        [ingredientId]: {
          ...currentRecord,
          quantity: Number(currentRecord?.quantity || 0) + quantity
        }
      };

      writeInventory(nextInventory);
      return nextInventory;
    });
  }, []);

  const deductInventory = useCallback((orderItems) => {
    const usage = calculateInventoryUsage(orderItems);
    const shortages = buildShortages(inventory, usage);

    if (shortages.length > 0) {
      return {
        ok: false,
        usage,
        shortages
      };
    }

    const nextInventory = { ...inventory };

    Object.entries(usage).forEach(([ingredientId, amount]) => {
      nextInventory[ingredientId] = {
        ...nextInventory[ingredientId],
        quantity: Number(nextInventory[ingredientId]?.quantity || 0) - amount
      };
    });

    setInventory(nextInventory);
    writeInventory(nextInventory);

    return {
      ok: true,
      usage,
      shortages: []
    };
  }, [inventory]);

  const restoreInventory = useCallback((orderItems) => {
    const usage = calculateInventoryUsage(orderItems);
    const nextInventory = { ...inventory };

    Object.entries(usage).forEach(([ingredientId, amount]) => {
      nextInventory[ingredientId] = {
        ...nextInventory[ingredientId],
        quantity: Number(nextInventory[ingredientId]?.quantity || 0) + amount
      };
    });

    setInventory(nextInventory);
    writeInventory(nextInventory);

    return {
      ok: true,
      usage
    };
  }, [inventory]);

  return {
    inventory,
    inventoryList,
    getInventory: () => inventory,
    addStock,
    deductInventory,
    restoreInventory
  };
}
