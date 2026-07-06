import { useCallback, useState } from "react";
import { DEFAULT_STORE_ID } from "../config/pricing.js";

export const CURRENT_CASH_STORAGE_KEY = "currentCash";
export const CASH_HISTORY_STORAGE_KEY = "cashHistory";

const pad = (value) => String(value).padStart(2, "0");
const timestamp = (date = new Date()) => ({
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
});

const readNumber = () => {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(CURRENT_CASH_STORAGE_KEY));
  return Number.isFinite(value) ? value : 0;
};

const readHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CASH_HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export function useCash() {
  const [currentCash, setCurrentCash] = useState(readNumber);
  const [cashHistory, setCashHistory] = useState(readHistory);

  const changeCash = useCallback((amount, type, metadata = {}) => {
    const change = Number(amount);
    if (!Number.isFinite(change) || change === 0) return { ok: false, reason: "invalid" };

    const nextBalance = currentCash + change;
    if (nextBalance < 0 && !metadata.allowNegative) return { ok: false, reason: "insufficient", available: currentCash };

    const now = new Date();
    const record = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      ...timestamp(now),
      createdAt: now.toISOString(),
      storeId: metadata.storeId || DEFAULT_STORE_ID,
      accountId: metadata.accountId || "store-cash",
      referenceId: metadata.referenceId || null,
      type,
      amount: change,
      balance: nextBalance
    };

    setCurrentCash(nextBalance);
    window.localStorage.setItem(CURRENT_CASH_STORAGE_KEY, String(nextBalance));
    setCashHistory((history) => {
      const next = [record, ...history].slice(0, 1000);
      window.localStorage.setItem(CASH_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return { ok: true, record };
  }, [currentCash]);

  const initializeCash = useCallback((amount) => {
    const target = Number(amount);
    if (!Number.isFinite(target) || target < 0) return { ok: false, reason: "invalid" };
    if (target === currentCash) return { ok: true };
    return changeCash(target - currentCash, "開店現金");
  }, [changeCash, currentCash]);

  return {
    currentCash,
    cashHistory,
    initializeCash,
    addCash: (amount, type = "現金收入", metadata) => changeCash(Math.abs(Number(amount)), type, metadata),
    deductCash: (amount, type = "現金支出", metadata) => changeCash(-Math.abs(Number(amount)), type, metadata),
    changeCash
  };
}
