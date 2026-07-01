import { useCallback, useState } from "react";

export const EXPENSES_STORAGE_KEY = "expenses";

const readExpenses = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(EXPENSES_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeExpenses = (records) =>
  window.localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(records));

export const expenseCategories = ["食材", "租金", "水電", "人事", "設備", "雜支", "其他"];

export function useExpenses() {
  const [expenses, setExpenses] = useState(readExpenses);

  const addExpense = useCallback((input) => {
    const amount = Number(input.amount);
    if (!input.date || !input.category || !input.item?.trim() || !Number.isFinite(amount) || amount <= 0) return false;
    const record = {
      id: Date.now(),
      date: input.date,
      category: input.category,
      item: input.item.trim(),
      amount,
      note: input.note?.trim() || "",
      createdAt: new Date().toISOString()
    };
    setExpenses((current) => {
      const next = [record, ...current];
      writeExpenses(next);
      return next;
    });
    return true;
  }, []);

  const updateExpense = useCallback((id, input) => {
    setExpenses((current) => {
      const next = current.map((record) => record.id === id
        ? { ...record, ...input, amount: Number(input.amount), item: input.item.trim(), note: input.note?.trim() || "" }
        : record);
      writeExpenses(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((current) => {
      const next = current.filter((record) => record.id !== id);
      writeExpenses(next);
      return next;
    });
  }, []);

  return { expenses, addExpense, updateExpense, deleteExpense };
}
