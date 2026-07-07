import { useMemo } from "react";
import { normalizeOrderMode } from "../config/pricing.js";
import { calculateNoodleServings } from "../config/inventoryConfig.js";

const localDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getDate = (record) => record.date || localDate(record.createdAt);
const validDate = (record) => {
  const date = new Date(record.createdAt || `${record.date}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const active = (sale) => sale.status !== "cancelled";
const sum = (records, field = "total") => records.reduce((value, record) => value + Number(record[field] || 0), 0);
const sameDay = (date, ref) => localDate(date) === localDate(ref);
const sameMonth = (date, ref) => date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
const inLastDays = (date, ref, days) => {
  const start = new Date(ref); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  const end = new Date(ref); end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};
const filterDate = (records, predicate) => records.filter((record) => {
  const date = validDate(record); return date ? predicate(date) : false;
});
const newest = (records) => [...records].sort((a, b) => (validDate(b)?.getTime() || 0) - (validDate(a)?.getTime() || 0));

export const calculateNetIncome = (revenue, expenses, losses) =>
  Number(revenue || 0) - Number(expenses || 0) - Number(losses || 0);

export const getTodaySales = (sales, ref = new Date()) => filterDate(sales.filter(active), (date) => sameDay(date, ref));
export const getWeeklySales = (sales, ref = new Date()) => filterDate(sales.filter(active), (date) => inLastDays(date, ref, 7));
export const getMonthlySales = (sales, ref = new Date()) => filterDate(sales.filter(active), (date) => sameMonth(date, ref));
export const getTodayOrders = (orders, ref = new Date()) => newest(filterDate(orders, (date) => sameDay(date, ref)));
export const getMonthlyOrders = (orders, ref = new Date()) => newest(filterDate(orders, (date) => inLastDays(date, ref, 30)));

const groupTotals = (records, key, amountKey) => {
  const grouped = new Map();
  records.forEach((record) => {
    const label = key(record);
    if (label) grouped.set(label, (grouped.get(label) || 0) + Number(record[amountKey] || 0));
  });
  return [...grouped.entries()].map(([name, value]) => ({ name, value }));
};

const productDistribution = (sales) => {
  const counts = new Map();
  sales.filter(active).forEach((sale) => sale.items?.forEach((line) => {
    const products = line.type === "combo" && Array.isArray(line.items) ? line.items : [line];
    products.forEach((product) => {
      const qty = Number(product.qty || 1) * Number(line.qty || 1);
      counts.set(product.name, (counts.get(product.name) || 0) + qty);
    });
  }));
  const total = [...counts.values()].reduce((value, qty) => value + qty, 0);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, qty]) => ({ name, qty, percent: total ? Math.round(qty / total * 100) : 0 }));
};

export function useAnalytics(sales, orders = sales, expenses = [], inventory = [], losses = [], funds = {}) {
  return useMemo(() => {
    const now = new Date();
    const activeSales = sales.filter(active);
    const todaySales = getTodaySales(sales, now);
    const weeklySales = getWeeklySales(sales, now);
    const monthlySales = getMonthlySales(sales, now);
    const todayExpenses = expenses.filter((item) => item.date === localDate(now));
    const monthlyExpenses = expenses.filter((item) => {
      const date = new Date(`${item.date}T00:00:00`); return !Number.isNaN(date.getTime()) && sameMonth(date, now);
    });
    const yearlyExpenses = expenses.filter((item) => String(item.date).startsWith(String(now.getFullYear())));
    const todayLosses = filterDate(losses, (date) => sameDay(date, now));
    const weeklyLosses = filterDate(losses, (date) => inLastDays(date, now, 7));
    const monthlyLosses = filterDate(losses, (date) => sameMonth(date, now));
    const todayRevenue = sum(todaySales);
    const todayExpense = sum(todayExpenses, "amount");
    const todayLossAmount = sum(todayLosses, "lossAmount");
    const monthlyRevenue = sum(monthlySales);
    const monthlyExpense = sum(monthlyExpenses, "amount");
    const monthlyLossAmount = sum(monthlyLosses, "lossAmount");
    const fundHistory = Array.isArray(funds.fundHistory) ? funds.fundHistory : [];
    const externalFundHistory = fundHistory.filter((record) => !String(record.type).includes("轉出") && !String(record.type).includes("轉入"));
    const cashRevenue = sum(todaySales.filter((sale) => sale.paymentMethod !== "bank"));
    const bankRevenue = sum(todaySales.filter((sale) => sale.paymentMethod === "bank"));
    const runningBalances = { cash: 0, bank: 0 };
    const noodleInventory = inventory.find((item) => item.id === "noodle");
    return {
      todaySales, weeklySales, monthlySales,
      todayOrders: getTodayOrders(orders.length ? orders : sales, now),
      monthlyOrders: getMonthlyOrders(orders.length ? orders : sales, now),
      todayOrderCount: todaySales.length,
      todayRevenue,
      weeklyRevenue: sum(weeklySales),
      monthlyRevenue,
      todayExpense,
      todayLosses,
      weeklyLosses,
      monthlyLosses,
      todayLossAmount,
      weeklyLossAmount: sum(weeklyLosses, "lossAmount"),
      monthlyLossAmount,
      todayNet: calculateNetIncome(todayRevenue, todayExpense, todayLossAmount),
      monthlyExpense,
      monthlyNet: calculateNetIncome(monthlyRevenue, monthlyExpense, monthlyLossAmount),
      yearlyExpense: sum(yearlyExpenses, "amount"),
      todayCashRevenue: cashRevenue,
      todayBankRevenue: bankRevenue,
      todayTotalIncome: cashRevenue + bankRevenue,
      cashBalance: Number(funds.accounts?.cash || 0),
      bankBalance: Number(funds.accounts?.bank || 0),
      totalFunds: Number(funds.totalFunds || 0),
      cashInflow: externalFundHistory.filter((record) => Number(record.amount) > 0).reduce((total, record) => total + Number(record.amount), 0),
      cashOutflow: Math.abs(externalFundHistory.filter((record) => Number(record.amount) < 0).reduce((total, record) => total + Number(record.amount), 0)),
      lowStockCount: inventory.filter((item) => Number(item.safeStock) > 0 && Number(item.quantity) <= Number(item.safeStock)).length,
      noodleInventory: {
        quantity: Number(noodleInventory?.quantity || 0),
        unit: noodleInventory?.unit || "G",
        servings: calculateNoodleServings(noodleInventory?.quantity)
      },
      dailyRevenue: groupTotals(activeSales, getDate, "total").sort((a, b) => a.name.localeCompare(b.name)).map(({ name, value }) => ({ date: name, revenue: value })),
      productDistribution: productDistribution(sales),
      modeRevenue: groupTotals(activeSales, (sale) => normalizeOrderMode(sale.mode) === "delivery" ? "外送" : "現場", "total"),
      expenseCategories: groupTotals(expenses, (item) => item.category, "amount"),
      expenseTrend: groupTotals(expenses, (item) => item.date, "amount").sort((a, b) => a.name.localeCompare(b.name)),
      lossDistribution: groupTotals(losses, (item) => `${item.ingredientName} (${item.unit})`, "quantity"),
      lossTrend: groupTotals(losses, (item) => item.date, "lossAmount").sort((a, b) => a.name.localeCompare(b.name)),
      cashTrend: [...fundHistory].reverse().map((record) => {
        runningBalances[record.accountId === "bank" ? "bank" : "cash"] = Number(record.balance || 0);
        return { name: `${record.date} ${record.time?.slice(0, 5)}`, cash: runningBalances.cash, bank: runningBalances.bank };
      })
    };
  }, [sales, orders, expenses, inventory, losses, funds]);
}
