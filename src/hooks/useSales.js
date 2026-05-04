import { useCallback, useState } from "react";

export const SALES_STORAGE_KEY = "sales";

const pad = (value) => String(value).padStart(2, "0");

const getLocalTimestampParts = (date = new Date()) => ({
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
});

export const readSales = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(SALES_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSales = (sales) => {
  window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
};

export function useSales() {
  const [sales, setSales] = useState(readSales);

  const recordSale = useCallback((order) => {
    const now = new Date();
    const { date, time } = getLocalTimestampParts(now);
    const sale = {
      id: now.getTime(),
      items: order.items,
      total: order.total,
      createdAt: now.toISOString(),
      date,
      time
    };

    setSales((currentSales) => {
      const nextSales = [...currentSales, sale];
      writeSales(nextSales);
      return nextSales;
    });

    return sale;
  }, []);

  const resetSales = useCallback(() => {
    window.localStorage.removeItem(SALES_STORAGE_KEY);
    setSales([]);
  }, []);

  return {
    sales,
    recordSale,
    resetSales
  };
}
