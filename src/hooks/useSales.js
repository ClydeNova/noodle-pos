import { useCallback, useState } from "react";
import { DEFAULT_STORE_ID, normalizeOrderMode } from "../config/pricing.js";

export const SALES_STORAGE_KEY = "sales";
export const ORDERS_STORAGE_KEY = "orders";

const pad = (value) => String(value).padStart(2, "0");

const getLocalTimestampParts = (date = new Date()) => ({
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
});

const readArray = (key) => {
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

const writeArray = (key, records) => {
  window.localStorage.setItem(key, JSON.stringify(records));
};

const normalizeSaleRecord = (record) => {
  const items = record.items || record.order?.items || [];
  const mode = normalizeOrderMode(record.mode || record.order?.mode);
  const total = Number(record.total ?? record.revenue ?? 0);
  const paymentMethod = record.paymentMethod === "bank" || record.paymentMethod === "transfer" ? "bank" : "cash";

  return {
    ...record,
    items,
    total,
    mode,
    paymentMethod,
    storeId: record.storeId || DEFAULT_STORE_ID,
    order: record.order || { items, mode, paymentMethod },
    revenue: Number(record.revenue ?? total)
  };
};

export const readSales = () => readArray(SALES_STORAGE_KEY).map(normalizeSaleRecord);
export const readOrders = () => readArray(ORDERS_STORAGE_KEY).map(normalizeSaleRecord);

export function useSales() {
  const [sales, setSales] = useState(readSales);
  const [orders, setOrders] = useState(() => {
    const storedOrders = readOrders();
    return storedOrders.length ? storedOrders : readSales();
  });

  const recordSale = useCallback((order) => {
    const now = new Date();
    const { date, time } = getLocalTimestampParts(now);
    const sale = {
      id: now.getTime(),
      items: order.items,
      total: order.total,
      createdAt: now.toISOString(),
      date,
      time,
      status: "completed",
      mode: normalizeOrderMode(order.mode),
      paymentMethod: order.paymentMethod || "cash",
      storeId: order.storeId || DEFAULT_STORE_ID,
      order: {
        items: order.items,
        mode: normalizeOrderMode(order.mode),
        paymentMethod: order.paymentMethod || "cash"
      },
      revenue: order.total
    };

    setSales((currentSales) => {
      const nextSales = [...currentSales, sale];
      writeArray(SALES_STORAGE_KEY, nextSales);
      return nextSales;
    });

    setOrders((currentOrders) => {
      const nextOrders = [...currentOrders, sale];
      writeArray(ORDERS_STORAGE_KEY, nextOrders);
      return nextOrders;
    });

    return sale;
  }, []);

  const cancelSale = useCallback((saleId) => {
    const cancelledAt = new Date().toISOString();
    let cancelledOrder = null;

    const markCancelled = (records) =>
      records.map((record) => {
        if (record.id !== saleId || record.status === "cancelled") {
          return record;
        }

        cancelledOrder = {
          ...record,
          status: "cancelled",
          cancelledAt
        };

        return cancelledOrder;
      });

    setSales((currentSales) => {
      const nextSales = markCancelled(currentSales);
      writeArray(SALES_STORAGE_KEY, nextSales);
      return nextSales;
    });

    setOrders((currentOrders) => {
      const nextOrders = markCancelled(currentOrders);
      writeArray(ORDERS_STORAGE_KEY, nextOrders);
      return nextOrders;
    });

    return cancelledOrder;
  }, []);

  const resetSales = useCallback(() => {
    window.localStorage.removeItem(SALES_STORAGE_KEY);
    window.localStorage.removeItem(ORDERS_STORAGE_KEY);
    setSales([]);
    setOrders([]);
  }, []);

  return {
    sales,
    orders,
    recordSale,
    cancelSale,
    resetSales
  };
}
