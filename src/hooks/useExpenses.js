import { useCallback, useState } from "react";
import { DEFAULT_STORE_ID } from "../config/pricing.js";

export const EXPENSES_STORAGE_KEY = "expenses";
export const expenseCategories = ["食材", "租金", "水電", "人事", "設備", "雜支", "其他"];
export const expensePaymentMethods = [
  { id: "cashFloat", label: "店內流動資金" },
  { id: "other", label: "其他" }
];

const readExpenses = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(EXPENSES_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.map((record) => ({
      ...record,
      storeId: record.storeId || DEFAULT_STORE_ID,
      paymentMethod: record.paymentMethod || "other"
    })) : [];
  } catch {
    return [];
  }
};

const writeExpenses = (records) =>
  window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(records));

export function useExpenses() {
  const [expenses, setExpenses] = useState(readExpenses);

  const addExpense = useCallback((input) => {
    const amount = Number(input.amount);
    if (!input.date || !input.category || !input.item?.trim() || !Number.isFinite(amount) || amount <= 0) return false;
    const record = {
      id: Date.now(),
      storeId: input.storeId || DEFAULT_STORE_ID,
      date: input.date,
      category: input.category,
      item: input.item.trim(),
      amount,
      paymentMethod: input.paymentMethod || "other",
      note: input.note?.trim() || "",
      createdAt: new Date().toISOString()
    };
    setExpenses((current) => {
      const next = [record, ...current];
      writeExpenses(next);
      return next;
    });
    return record;
  }, []);

  const updateExpense = useCallback((id, input) => {
    let updated = null;
    setExpenses((current) => {
      const next = current.map((record) => {
        if (record.id !== id) return record;
        updated = {
          ...record,
          ...input,
          amount: Number(input.amount),
          paymentMethod: input.paymentMethod || "other",
          item: input.item.trim(),
          note: input.note?.trim() || ""
        };
        return updated;
      });
      writeExpenses(next);
      return next;
    });
    return updated;
  }, []);

  const deleteExpense = useCallback((id) => {
    let deleted = null;
    setExpenses((current) => {
      deleted = current.find((record) => record.id === id) || null;
      const next = current.filter((record) => record.id !== id);
      writeExpenses(next);
      return next;
    });
    return deleted;
  }, []);

  return { expenses, addExpense, updateExpense, deleteExpense };
}
