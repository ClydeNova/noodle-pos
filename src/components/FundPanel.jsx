import { useState } from "react";
import { fundAccountLabel, fundAccountOptions } from "../hooks/useFunds.js";

const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;
const signedMoney = (value) => `${Number(value) > 0 ? "+" : "-"}$${Math.abs(Number(value || 0)).toLocaleString("zh-TW")}`;

export function FundPanel({ funds }) {
  const [opening, setOpening] = useState({ cash: "", bank: "" });
  const [movement, setMovement] = useState({ accountId: "cash", action: "deposit", targetAccountId: "bank", amount: "", note: "" });

  const initialize = (accountId) => {
    const amount = Number(opening[accountId]);
    if (!Number.isFinite(amount) || amount < 0) return;
    if (!window.confirm(`確定將${fundAccountLabel(accountId)}設定為 ${money(amount)}？`)) return;
    const result = funds.initializeAccount(accountId, amount);
    if (result.ok) setOpening((current) => ({ ...current, [accountId]: "" }));
  };

  const submitMovement = () => {
    const amount = Number(movement.amount);
    if (!Number.isFinite(amount) || amount === 0) return;
    let result;
    if (movement.action === "transfer") {
      result = funds.transfer(movement.accountId, movement.targetAccountId, amount, movement.note);
    } else if (movement.action === "deposit") {
      result = funds.deposit(movement.accountId, amount, "手動入金", { note: movement.note });
    } else if (movement.action === "withdraw") {
      result = funds.withdraw(movement.accountId, amount, "手動支出", { note: movement.note });
    } else {
      result = funds.adjust(movement.accountId, amount, movement.note);
    }
    if (!result.ok) {
      window.alert(result.reason === "insufficient" ? `${fundAccountLabel(result.accountId)}餘額不足` : "請確認資金異動資料");
      return;
    }
    setMovement((current) => ({ ...current, amount: "", note: "" }));
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-5 shadow-lg">
      <div><p className="text-sm tracking-[.18em] text-[#C6A96B]/75">FUND ACCOUNTS</p><h2 className="mt-1 text-2xl font-medium">資金管理</h2></div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {fundAccountOptions.map((account) => <div key={account.id} className="rounded-2xl bg-[#0F1115] p-4"><p className="text-sm text-zinc-400">{account.label}</p><p className="mt-2 text-3xl font-semibold">{money(funds.accounts[account.id])}</p><div className="mt-4 flex gap-2"><input type="number" min="0" inputMode="decimal" value={opening[account.id]} onChange={(event)=>setOpening((current)=>({...current,[account.id]:event.target.value}))} placeholder="期初金額" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#1A1D23] px-3"/><button type="button" onClick={()=>initialize(account.id)} className="min-h-12 rounded-xl border border-[#C6A96B]/30 px-4 text-[#C6A96B]">設定</button></div></div>)}
        <div className="rounded-2xl border border-[#C6A96B]/20 bg-[#C6A96B]/10 p-4"><p className="text-sm text-[#C6A96B]">總資金</p><p className="mt-2 text-3xl font-semibold text-zinc-50">{money(funds.totalFunds)}</p></div>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-[#0F1115] p-4 md:grid-cols-2 xl:grid-cols-6">
        <select value={movement.accountId} onChange={(e)=>setMovement((value)=>({...value,accountId:e.target.value,targetAccountId:e.target.value==="cash"?"bank":"cash"}))} className="min-h-14 rounded-xl bg-[#1A1D23] px-4">{fundAccountOptions.map((account)=><option key={account.id} value={account.id}>{account.label}</option>)}</select>
        <select value={movement.action} onChange={(e)=>setMovement((value)=>({...value,action:e.target.value}))} className="min-h-14 rounded-xl bg-[#1A1D23] px-4"><option value="deposit">入金</option><option value="withdraw">支出</option><option value="adjust">調整（可輸入負數）</option><option value="transfer">轉帳</option></select>
        {movement.action === "transfer" ? <select value={movement.targetAccountId} onChange={(e)=>setMovement((value)=>({...value,targetAccountId:e.target.value}))} className="min-h-14 rounded-xl bg-[#1A1D23] px-4">{fundAccountOptions.filter((account)=>account.id!==movement.accountId).map((account)=><option key={account.id} value={account.id}>{account.label}</option>)}</select> : <div className="hidden xl:block" />}
        <input type="number" inputMode="decimal" value={movement.amount} onChange={(e)=>setMovement((value)=>({...value,amount:e.target.value}))} placeholder="金額" className="min-h-14 rounded-xl bg-[#1A1D23] px-4" />
        <input value={movement.note} onChange={(e)=>setMovement((value)=>({...value,note:e.target.value}))} placeholder="備註" className="min-h-14 rounded-xl bg-[#1A1D23] px-4" />
        <button type="button" onClick={submitMovement} className="min-h-14 rounded-xl bg-[#C6A96B] px-5 font-semibold text-[#0F1115]">確認異動</button>
      </div>
      <div className="mt-5 max-h-72 overflow-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-[#1A1D23] text-zinc-400"><tr>{["日期","時間","帳戶","類型","金額","餘額","備註"].map((label)=><th key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{funds.fundHistory.map((record)=><tr key={record.id} className="border-t border-white/10"><td className="px-3 py-3">{record.date}</td><td className="px-3 py-3 text-zinc-400">{record.time}</td><td className="px-3 py-3">{record.accountName||fundAccountLabel(record.accountId)}</td><td className="px-3 py-3">{record.type}</td><td className={`px-3 py-3 font-semibold ${record.amount<0?"text-red-300":"text-[#C6A96B]"}`}>{signedMoney(record.amount)}</td><td className="px-3 py-3">{money(record.balance)}</td><td className="px-3 py-3 text-zinc-400">{record.note||"-"}</td></tr>)}</tbody></table>{!funds.fundHistory.length?<div className="p-8 text-center text-zinc-500">尚無資金異動</div>:null}</div>
    </article>
  );
}
