import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductPrice, menuById } from "../data/menu.js";

export const ORDER_STORAGE_KEY = "order";
export const ORDER_MODE_STORAGE_KEY = "orderMode";

const readMode = () => {
  if (typeof window === "undefined") return "retail";
  return window.localStorage.getItem(ORDER_MODE_STORAGE_KEY) === "wholesale"
    ? "wholesale"
    : "retail";
};

const getLineId = (product, sauce) =>
  `${product.id}${sauce ? `:${sauce.id}` : ""}`;

const createOrderLine = (product, mode, qty = 1, sauce = null) => ({
  id: getLineId(product, sauce),
  productId: product.id,
  name: product.name,
  price: getProductPrice(product, mode),
  qty,
  type: product.type,
  ...(product.items ? { items: product.items } : {}),
  ...(sauce ? { sauce } : {})
});

const readStoredOrder = (mode) => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const productId = item.productId || item.id?.split(":")[0] || item.id;
      const product = menuById[productId];
      const qty = Number(item.qty ?? item.quantity ?? 0);
      return product && qty > 0 ? createOrderLine(product, mode, qty, item.sauce) : null;
    }).filter(Boolean);
  } catch {
    return [];
  }
};

export function useOrder() {
  const [orderMode, setOrderModeState] = useState(readMode);
  const [orderItems, setOrderItems] = useState(() => readStoredOrder(readMode()));

  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderItems));
  }, [orderItems]);

  const setOrderMode = useCallback((mode) => {
    const nextMode = mode === "wholesale" ? "wholesale" : "retail";
    setOrderModeState(nextMode);
    window.localStorage.setItem(ORDER_MODE_STORAGE_KEY, nextMode);
    setOrderItems((items) => items.map((item) => {
      const product = menuById[item.productId];
      return product ? { ...item, price: getProductPrice(product, nextMode) } : item;
    }));
  }, []);

  const addItem = useCallback((product, options = {}) => {
    setOrderItems((items) => {
      const lineId = getLineId(product, options.sauce);
      const existing = items.find((item) => item.id === lineId);
      return existing
        ? items.map((item) => item.id === lineId ? { ...item, qty: item.qty + 1 } : item)
        : [...items, createOrderLine(product, orderMode, 1, options.sauce)];
    });
  }, [orderMode]);

  const removeOne = useCallback((lineId) => {
    setOrderItems((items) => items
      .map((item) => item.id === lineId ? { ...item, qty: item.qty - 1 } : item)
      .filter((item) => item.qty > 0));
  }, []);

  const clearOrder = useCallback(() => setOrderItems([]), []);
  const total = useMemo(() => orderItems.reduce((sum, item) => sum + item.price * item.qty, 0), [orderItems]);
  const itemCount = useMemo(() => orderItems.reduce((sum, item) => sum + item.qty, 0), [orderItems]);

  return { orderItems, orderMode, setOrderMode, total, itemCount, addItem, removeOne, clearOrder };
}
