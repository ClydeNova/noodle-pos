import { useMemo } from "react";

const getSaleDate = (sale) => {
  if (sale.date) {
    return sale.date;
  }

  const createdAt = new Date(sale.createdAt);

  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  return `${createdAt.getFullYear()}-${month}-${day}`;
};

const getSaleTime = (sale) => {
  if (sale.time) {
    return sale.time;
  }

  const createdAt = new Date(sale.createdAt);

  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  const hours = String(createdAt.getHours()).padStart(2, "0");
  const minutes = String(createdAt.getMinutes()).padStart(2, "0");
  const seconds = String(createdAt.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const normalizeOrderTimestamps = (records) =>
  records.map((record) => ({
    ...record,
    date: getSaleDate(record),
    time: getSaleTime(record),
    status: record.status || "completed"
  }));

const toValidCreatedAt = (sale) => {
  const createdAt = new Date(sale.createdAt);
  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
};

const isSameLocalDay = (date, referenceDate) =>
  date.getFullYear() === referenceDate.getFullYear() &&
  date.getMonth() === referenceDate.getMonth() &&
  date.getDate() === referenceDate.getDate();

const isCurrentMonth = (date, referenceDate) =>
  date.getFullYear() === referenceDate.getFullYear() &&
  date.getMonth() === referenceDate.getMonth();

const isWithinLastSevenDays = (date, referenceDate) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

const isWithinLastThirtyDays = (date, referenceDate) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 29);

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

const filterRecordsByDate = (records, predicate) =>
  records.filter((record) => {
    const createdAt = toValidCreatedAt(record);
    return createdAt ? predicate(createdAt) : false;
  });

const newestFirst = (records) =>
  [...records].sort((a, b) => {
    const aTime = toValidCreatedAt(a)?.getTime() || 0;
    const bTime = toValidCreatedAt(b)?.getTime() || 0;
    return bTime - aTime;
  });

const isActiveSale = (sale) => sale.status !== "cancelled";

export const getTodaySales = (sales, referenceDate = new Date()) =>
  filterRecordsByDate(sales.filter(isActiveSale), (createdAt) =>
    isSameLocalDay(createdAt, referenceDate)
  );

export const getWeeklySales = (sales, referenceDate = new Date()) =>
  filterRecordsByDate(sales.filter(isActiveSale), (createdAt) =>
    isWithinLastSevenDays(createdAt, referenceDate)
  );

export const getMonthlySales = (sales, referenceDate = new Date()) =>
  filterRecordsByDate(sales.filter(isActiveSale), (createdAt) =>
    isCurrentMonth(createdAt, referenceDate)
  );

export const getTodayOrders = (orders, referenceDate = new Date()) =>
  normalizeOrderTimestamps(
    newestFirst(
      filterRecordsByDate(orders, (createdAt) => isSameLocalDay(createdAt, referenceDate))
    )
  );

export const getMonthlyOrders = (orders, referenceDate = new Date()) =>
  normalizeOrderTimestamps(
    newestFirst(
      filterRecordsByDate(orders, (createdAt) =>
        isWithinLastThirtyDays(createdAt, referenceDate)
      )
    )
  );

const sumSales = (sales) => sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

const buildDailyRevenue = (sales) => {
  const revenueByDate = new Map();

  sales.filter(isActiveSale).forEach((sale) => {
    const date = getSaleDate(sale);

    if (!date) {
      return;
    }

    revenueByDate.set(date, (revenueByDate.get(date) || 0) + Number(sale.total || 0));
  });

  return [...revenueByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
};

const buildProductDistribution = (sales) => {
  const quantityByProduct = new Map();

  sales.filter(isActiveSale).forEach((sale) => {
    sale.items?.forEach((lineItem) => {
      if (lineItem.type === "combo" && Array.isArray(lineItem.items)) {
        lineItem.items.forEach((comboItem) => {
          const qty = Number(comboItem.qty || 1) * Number(lineItem.qty || 1);
          quantityByProduct.set(
            comboItem.name,
            (quantityByProduct.get(comboItem.name) || 0) + qty
          );
        });
        return;
      }

      quantityByProduct.set(
        lineItem.name,
        (quantityByProduct.get(lineItem.name) || 0) + Number(lineItem.qty || 0)
      );
    });
  });

  const totalQty = [...quantityByProduct.values()].reduce((sum, qty) => sum + qty, 0);

  return [...quantityByProduct.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([name, qty]) => ({
      name,
      qty,
      percent: totalQty ? Math.round((qty / totalQty) * 100) : 0
    }));
};

export function useAnalytics(sales, orders = sales) {
  return useMemo(() => {
    const todaySales = getTodaySales(sales);
    const weeklySales = getWeeklySales(sales);
    const monthlySales = getMonthlySales(sales);
    const orderRecords = orders.length ? orders : sales;
    const todayOrders = getTodayOrders(orderRecords);
    const monthlyOrders = getMonthlyOrders(orderRecords);

    return {
      todaySales,
      weeklySales,
      monthlySales,
      todayOrders,
      monthlyOrders,
      todayRevenue: sumSales(todaySales),
      weeklyRevenue: sumSales(weeklySales),
      monthlyRevenue: sumSales(monthlySales),
      dailyRevenue: buildDailyRevenue(sales),
      productDistribution: buildProductDistribution(sales)
    };
  }, [sales, orders]);
}
