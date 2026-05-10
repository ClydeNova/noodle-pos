import { useCallback, useEffect, useMemo, useState } from "react";
import { menuById } from "../data/menu.js";

export const ORDER_STORAGE_KEY = "order";

const getLineId = (product, options = {}) =>
  options.sauce ? `${product.id}:${options.sauce.id}` : product.id;

const createOrderLine = (product, qty = 1, options = {}) => ({
  id: getLineId(product, options),
  productId: product.id,
  name: product.name,
  price: product.price,
  qty,
  type: product.type,
  ...(product.items ? { items: product.items } : {}),
  ...(options.sauce ? { sauce: options.sauce } : {})
});

const normalizeStoredOrder = (storedItems) =>
  storedItems
    .map((item) => {
      const product = menuById[item.productId || item.id?.split(":")[0] || item.id];
      const qty = Number(item.qty ?? item.quantity ?? 0);

      if (!product || !Number.isFinite(qty) || qty <= 0) {
        return null;
      }

      return createOrderLine(product, qty, { sauce: item.sauce });
    })
    .filter(Boolean);

const readStoredOrder = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? normalizeStoredOrder(parsed) : [];
  } catch {
    return [];
  }
};

export function useOrder() {
  const [orderItems, setOrderItems] = useState(readStoredOrder);

  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderItems));
  }, [orderItems]);

  const addItem = useCallback((product, options = {}) => {
    setOrderItems((currentItems) => {
      const lineId = getLineId(product, options);
      const existingItem = currentItems.find((item) => item.id === lineId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === lineId ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...currentItems, createOrderLine(product, 1, options)];
    });
  }, []);

  const removeOne = useCallback((lineId) => {
    setOrderItems((currentItems) =>
      currentItems
        .map((item) => (item.id === lineId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  }, []);

  const clearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  const total = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [orderItems]
  );

  const itemCount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.qty, 0),
    [orderItems]
  );

  return {
    orderItems,
    total,
    itemCount,
    addItem,
    removeOne,
    clearOrder
  };
}
