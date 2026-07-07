import { useCallback, useRef, useState } from "react";
import { DEFAULT_STORE_ID } from "../config/pricing.js";

export const FUND_ACCOUNTS_STORAGE_KEY = "fundAccounts";
export const FUND_HISTORY_STORAGE_KEY = "fundHistory";
export const LEGACY_CURRENT_CASH_STORAGE_KEY = "currentCash";
export const LEGACY_CASH_HISTORY_STORAGE_KEY = "cashHistory";

export const fundAccountOptions = [
  { id: "cash", label: "店內現金" },
  { id: "bank", label: "銀行戶頭" }
];

export const fundAccountLabel = (accountId) =>
  fundAccountOptions.find((account) => account.id === accountId)?.label || accountId;

const pad = (value) => String(value).padStart(2, "0");
const timestamp = (date = new Date()) => ({
  date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
});

const readAccounts = () => {
  if (typeof window === "undefined") return { cash: 0, bank: 0 };
  try {
    const stored = JSON.parse(window.localStorage.getItem(FUND_ACCOUNTS_STORAGE_KEY) || "null");
    if (stored && typeof stored === "object") {
      return { cash: Number(stored.cash || 0), bank: Number(stored.bank || 0) };
    }
  } catch {
    // Fall through to legacy cash migration.
  }
  const legacyCash = Number(window.localStorage.getItem(LEGACY_CURRENT_CASH_STORAGE_KEY));
  return { cash: Number.isFinite(legacyCash) ? legacyCash : 0, bank: 0 };
};

const readHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const current = JSON.parse(window.localStorage.getItem(FUND_HISTORY_STORAGE_KEY) || "null");
    if (Array.isArray(current)) return current;
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_CASH_HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(legacy) ? legacy.map((record) => ({
      ...record,
      accountId: "cash",
      accountName: "店內現金",
      storeId: record.storeId || DEFAULT_STORE_ID,
      note: record.note || ""
    })) : [];
  } catch {
    return [];
  }
};

export const applyAccountChanges = (accounts, changes, allowNegative = false) => {
  const combined = changes.reduce((result, change) => {
    result[change.accountId] = (result[change.accountId] || 0) + Number(change.amount || 0);
    return result;
  }, {});
  const nextAccounts = { ...accounts };
  let hasChange = false;
  for (const [accountId, amount] of Object.entries(combined)) {
    if (!(accountId in nextAccounts) || !Number.isFinite(amount)) return { ok: false, reason: "invalid" };
    if (amount === 0) continue;
    hasChange = true;
    if (nextAccounts[accountId] + amount < 0 && !allowNegative) {
      return { ok: false, reason: "insufficient", accountId, available: nextAccounts[accountId] };
    }
    nextAccounts[accountId] += amount;
  }
  return { ok: true, accounts: nextAccounts, noChange: !hasChange };
};

export function useFunds() {
  const [accounts, setAccounts] = useState(readAccounts);
  const [fundHistory, setFundHistory] = useState(readHistory);
  const accountsRef = useRef(accounts);

  const commitChanges = useCallback((changes, metadata = {}) => {
    const result = applyAccountChanges(accountsRef.current, changes, metadata.allowNegative);
    if (!result.ok) return result;
    const nextAccounts = result.accounts;
    if (result.noChange) return { ok: true, records: [], accounts: nextAccounts };

    const now = new Date();
    const movementId = metadata.movementId || `${now.getTime()}-${Math.random().toString(16).slice(2)}`;
    const records = changes.map((change, index) => ({
      id: `${movementId}-${index}`,
      movementId,
      ...timestamp(now),
      createdAt: now.toISOString(),
      storeId: metadata.storeId || DEFAULT_STORE_ID,
      accountId: change.accountId,
      accountName: fundAccountLabel(change.accountId),
      referenceId: metadata.referenceId || null,
      type: change.type || metadata.type || "資金調整",
      amount: Number(change.amount),
      balance: nextAccounts[change.accountId],
      note: change.note || metadata.note || ""
    }));

    accountsRef.current = nextAccounts;
    setAccounts(nextAccounts);
    window.localStorage.setItem(FUND_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts));
    setFundHistory((history) => {
      const next = [...records, ...history].slice(0, 2000);
      window.localStorage.setItem(FUND_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return { ok: true, records, accounts: nextAccounts };
  }, []);

  const changeFund = useCallback((accountId, amount, type, metadata = {}) =>
    commitChanges([{ accountId, amount: Number(amount), type, note: metadata.note }], metadata), [commitChanges]);

  const initializeAccount = useCallback((accountId, targetAmount) => {
    const target = Number(targetAmount);
    if (!Number.isFinite(target) || target < 0 || !(accountId in accountsRef.current)) return { ok: false, reason: "invalid" };
    const difference = target - accountsRef.current[accountId];
    if (difference === 0) return { ok: true, accounts: accountsRef.current };
    return changeFund(accountId, difference, "期初資金");
  }, [changeFund]);

  const transfer = useCallback((fromAccountId, toAccountId, amount, note = "") => {
    const value = Math.abs(Number(amount));
    if (!value || fromAccountId === toAccountId) return { ok: false, reason: "invalid" };
    return commitChanges([
      { accountId: fromAccountId, amount: -value, type: `${fundAccountLabel(fromAccountId)}轉出`, note },
      { accountId: toAccountId, amount: value, type: `${fundAccountLabel(toAccountId)}轉入`, note }
    ], { note });
  }, [commitChanges]);

  return {
    accounts,
    fundHistory,
    totalFunds: Number(accounts.cash || 0) + Number(accounts.bank || 0),
    initializeAccount,
    deposit: (accountId, amount, type = "入金", metadata) => changeFund(accountId, Math.abs(Number(amount)), type, metadata),
    withdraw: (accountId, amount, type = "支出", metadata) => changeFund(accountId, -Math.abs(Number(amount)), type, metadata),
    adjust: (accountId, amount, note) => changeFund(accountId, Number(amount), "資金調整", { note }),
    transfer,
    commitChanges
  };
}
