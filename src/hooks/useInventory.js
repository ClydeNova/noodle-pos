import { useCallback, useMemo, useState } from "react";
import { ingredients, productInventoryUsage } from "../data/ingredients.js";
import { legacyInventoryProductIds } from "../config/inventoryMapping.js";

export const INVENTORY_STORAGE_KEY = "inventory";
export const INVENTORY_HISTORY_STORAGE_KEY = "inventoryHistory";

const pad = (value) => String(value).padStart(2, "0");

const getLocalTimestampParts = (date = new Date()) => ({
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
});

const readJsonObject = (key) => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const readJsonArray = (key) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeInventory = (inventory) => {
  window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
};

const writeHistory = (history) => {
  window.localStorage.setItem(INVENTORY_HISTORY_STORAGE_KEY, JSON.stringify(history));
};

const createInventoryRecord = (ingredient, storedInventory) => {
  const currentRecord = storedInventory[ingredient.id];
  const legacyRecord = ingredient.legacyId ? storedInventory[ingredient.legacyId] : null;
  const storedRecord = currentRecord || legacyRecord || {};
  const divisor = !currentRecord && legacyRecord ? Number(ingredient.legacyDivisor || 1) : 1;

  return {
    ...ingredient,
    quantity: Number(storedRecord.quantity || 0) / divisor,
    safeStock: Number(storedRecord.safeStock || 0) / divisor
  };
};

const normalizeInventory = (storedInventory) =>
  Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      createInventoryRecord(ingredient, storedInventory)
    ])
  );

const createHistoryRecord = ({ ingredient, action, quantity, unit }) => {
  const now = new Date();
  const { date, time } = getLocalTimestampParts(now);

  return {
    id: `${now.getTime()}-${ingredient.id}-${Math.random().toString(16).slice(2)}`,
    date,
    time,
    ingredientId: ingredient.id,
    ingredientName: ingredient.name,
    action,
    quantity,
    unit
  };
};

const addUsage = (usage, ingredientId, amount) => {
  if (!ingredientId || !amount) {
    return;
  }

  usage[ingredientId] = (usage[ingredientId] || 0) + amount;
};

const applyProductUsage = (usage, productId, multiplier, sauce) => {
  const normalizedProductId = legacyInventoryProductIds[productId] || productId;
  const productUsage = productInventoryUsage[normalizedProductId];

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
  return normalizeInventory(readJsonObject(INVENTORY_STORAGE_KEY));
}

export function useInventory() {
  const [inventory, setInventory] = useState(getInventory);
  const [history, setHistory] = useState(() => readJsonArray(INVENTORY_HISTORY_STORAGE_KEY));

  const inventoryList = useMemo(() => Object.values(inventory), [inventory]);

  const appendHistory = useCallback((records) => {
    setHistory((currentHistory) => {
      const nextHistory = [...records, ...currentHistory].slice(0, 300);
      writeHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const updateInventoryRecord = useCallback((ingredientId, updater) => {
    setInventory((currentInventory) => {
      const currentRecord = currentInventory[ingredientId];
      const nextInventory = {
        ...currentInventory,
        [ingredientId]: updater(currentRecord)
      };

      writeInventory(nextInventory);
      return nextInventory;
    });
  }, []);

  const addStock = useCallback((ingredientId, amount) => {
    const quantity = Number(amount);
    const ingredient = inventory[ingredientId];

    if (!ingredient || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    updateInventoryRecord(ingredientId, (currentRecord) => ({
      ...currentRecord,
      quantity: Number(currentRecord?.quantity || 0) + quantity
    }));

    appendHistory([
      createHistoryRecord({
        ingredient,
        action: "入庫",
        quantity,
        unit: ingredient.unit
      })
    ]);
  }, [appendHistory, inventory, updateInventoryRecord]);

  const adjustStock = useCallback((ingredientId, amount) => {
    const quantity = Number(amount);
    const ingredient = inventory[ingredientId];

    if (!ingredient || !Number.isFinite(quantity) || quantity === 0) {
      return;
    }

    updateInventoryRecord(ingredientId, (currentRecord) => ({
      ...currentRecord,
      quantity: Math.max(0, Number(currentRecord?.quantity || 0) + quantity)
    }));

    appendHistory([
      createHistoryRecord({
        ingredient,
        action: "調整",
        quantity,
        unit: ingredient.unit
      })
    ]);
  }, [appendHistory, inventory, updateInventoryRecord]);

  const setSafeStock = useCallback((ingredientId, amount) => {
    const safeStock = Number(amount);

    if (!Number.isFinite(safeStock) || safeStock < 0) {
      return;
    }

    updateInventoryRecord(ingredientId, (currentRecord) => ({
      ...currentRecord,
      safeStock
    }));
  }, [updateInventoryRecord]);

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
    const records = [];

    Object.entries(usage).forEach(([ingredientId, amount]) => {
      const ingredient = nextInventory[ingredientId];
      nextInventory[ingredientId] = {
        ...ingredient,
        quantity: Number(ingredient?.quantity || 0) - amount
      };
      records.push(
        createHistoryRecord({
          ingredient,
          action: "自動扣庫存",
          quantity: -amount,
          unit: ingredient?.unit || ""
        })
      );
    });

    setInventory(nextInventory);
    writeInventory(nextInventory);
    appendHistory(records);

    return {
      ok: true,
      usage,
      shortages: []
    };
  }, [appendHistory, inventory]);

  const restoreInventory = useCallback((orderItems) => {
    const usage = calculateInventoryUsage(orderItems);
    const nextInventory = { ...inventory };
    const records = [];

    Object.entries(usage).forEach(([ingredientId, amount]) => {
      const ingredient = nextInventory[ingredientId];
      nextInventory[ingredientId] = {
        ...ingredient,
        quantity: Number(ingredient?.quantity || 0) + amount
      };
      records.push(
        createHistoryRecord({
          ingredient,
          action: "取消回補",
          quantity: amount,
          unit: ingredient?.unit || ""
        })
      );
    });

    setInventory(nextInventory);
    writeInventory(nextInventory);
    appendHistory(records);

    return {
      ok: true,
      usage
    };
  }, [appendHistory, inventory]);

  return {
    inventory,
    inventoryList,
    inventoryHistory: history,
    getInventory: () => inventory,
    addStock,
    adjustStock,
    setSafeStock,
    deductInventory,
    restoreInventory
  };
}
