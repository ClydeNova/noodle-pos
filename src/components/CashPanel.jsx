import { useState } from "react";

const money = (value) => `$${Number(value || 0).toLocaleString("zh-TW")}`;
const signedMoney = (value) => `${Number(value) > 0 ? "+" : "-"}$${Math.abs(Number(value || 0)).toLocaleString("zh-TW")}`;

export function CashPanel({ currentCash, history, onInitialize }) {
  const [openingCash, setOpeningCash] = useState("");

  const initialize = () => {
    const amount = Number(openingCash);
    if (!Number.isFinite(amount) || amount < 0) return;
    if (!window.confirm(`確定將店內流動資金設定為 ${money(amount)}？`)) return;
    const result = onInitialize(amount);
    if (result.ok) setOpeningCash("");
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#1A1D23] p-5 shadow-lg">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[.18em] text-[#C6A96B]/75">CASH FLOAT</p>
          <h2 className="mt-1 text-2xl font-medium">店內流動資金</h2>
          <p className="mt-3 text-4xl font-semibold">{money(currentCash)}</p>
        </div>
        <div className="flex gap-2">
          <input type="number" min="0" inputMode="decimal" value={openingCash} onChange={(event) => setOpeningCash(event.target.value)} placeholder="今日開店現金" className="min-h-14 w-44 rounded-xl border border-white/10 bg-[#0F1115] px-4" />
          <button type="button" onClick={initialize} className="min-h-14 rounded-xl bg-[#C6A96B] px-5 font-semibold text-[#0F1115]">設定</button>
        </div>
      </div>
      <div className="mt-5 max-h-64 overflow-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="sticky top-0 bg-[#1A1D23] text-zinc-400"><tr>{["日期", "時間", "類型", "金額", "餘額"].map((label) => <th key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead>
          <tbody>{history.map((record) => <tr key={record.id} className="border-t border-white/10"><td className="px-3 py-3">{record.date}</td><td className="px-3 py-3 text-zinc-400">{record.time}</td><td className="px-3 py-3">{record.type}</td><td className={`px-3 py-3 font-semibold ${record.amount < 0 ? "text-red-300" : "text-[#C6A96B]"}`}>{signedMoney(record.amount)}</td><td className="px-3 py-3">{money(record.balance)}</td></tr>)}</tbody>
        </table>
        {!history.length ? <div className="p-8 text-center text-zinc-500">尚無現金異動</div> : null}
      </div>
    </article>
  );
}
