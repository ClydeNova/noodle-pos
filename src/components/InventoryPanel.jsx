import { useState } from "react";
import { calculateNoodleServings } from "../config/inventoryConfig.js";
import { lossCategories } from "../config/inventoryMapping.js";

const number = (value) => Number(value || 0).toLocaleString("zh-TW");
const signed = (value, unit) => `${Number(value) > 0 ? "+" : ""}${number(value)} ${unit}`;

function StockValue({ label, value, unit, isNoodle, accent = false }) {
  return (
    <div className="rounded-xl bg-[#0F1115] p-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-[#C6A96B]" : "text-zinc-50"}`}>
        {number(value)} <small className="text-sm text-zinc-500">{unit}</small>
      </p>
      {isNoodle ? (
        <p className="mt-2 text-sm font-medium text-[#C6A96B]">
          約可製作 {calculateNoodleServings(value)}份
        </p>
      ) : null}
    </div>
  );
}

export function InventoryPanel({ inventoryItems, inventoryHistory, onAddStock, onAdjustStock, onSetSafeStock, onRecordLoss }) {
  const [stock, setStock] = useState({});
  const [adjust, setAdjust] = useState({});
  const [safe, setSafe] = useState({});
  const [loss, setLoss] = useState({ ingredientId: inventoryItems[0]?.id || "", quantity: "", reason: lossCategories[0], note: "", lossAmount: "" });

  const submitAdjust = (item) => {
    const amount = Number(adjust[item.id]);
    if (!amount) return;
    const result = Math.max(0, Number(item.quantity) + amount);
    if (!window.confirm(`確定調整 ${item.name}？\n目前：${number(item.quantity)} ${item.unit}\n調整：${signed(amount, item.unit)}\n結果：${number(result)} ${item.unit}`)) return;
    onAdjustStock(item.id, amount);
    setAdjust((values) => ({ ...values, [item.id]: "" }));
  };

  const submitLoss = () => {
    const ingredient = inventoryItems.find((item) => item.id === loss.ingredientId);
    const quantity = Number(loss.quantity);
    if (!ingredient || !quantity || !loss.reason) return;
    const result = Number(ingredient.quantity) - quantity;
    if (!window.confirm(`確定記錄損耗？\n品項：${ingredient.name}\n數量：${number(quantity)} ${ingredient.unit}\n原因：${loss.reason}\n結果：${number(result)} ${ingredient.unit}`)) return;
    const response = onRecordLoss(loss);
    if (!response.ok) {
      window.alert(response.reason === "insufficient" ? `庫存不足，目前僅有 ${number(response.available)} ${response.unit}` : "請完整填寫損耗資料");
      return;
    }
    setLoss((current) => ({ ...current, quantity: "", note: "", lossAmount: "" }));
  };

  return (
    <section className="mx-auto w-full max-w-7xl pb-8">
      <div className="mb-6">
        <p className="text-sm tracking-[.2em] text-[#C6A96B]/75">INVENTORY</p>
        <h1 className="mt-1 text-4xl font-medium">庫存管理</h1>
        <p className="mt-2 text-zinc-400">入庫、調整、損耗、安全庫存與異動紀錄</p>
      </div>

      <article className="mb-6 rounded-2xl border border-red-400/15 bg-[#1A1D23] p-5 shadow-lg">
        <div><p className="text-sm tracking-[.18em] text-red-400/75">INVENTORY LOSS</p><h2 className="mt-1 text-2xl font-medium">損耗</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select value={loss.ingredientId} onChange={(event) => setLoss((value) => ({ ...value, ingredientId: event.target.value }))} className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4">{inventoryItems.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select>
          <input type="number" min="0" inputMode="decimal" value={loss.quantity} onChange={(event) => setLoss((value) => ({ ...value, quantity: event.target.value }))} placeholder="損耗數量" className="min-h-14 rounded-xl bg-[#0F1115] px-4" />
          <select value={loss.reason} onChange={(event) => setLoss((value) => ({ ...value, reason: event.target.value }))} className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4">{lossCategories.map((reason) => <option key={reason}>{reason}</option>)}</select>
          <input value={loss.note} onChange={(event) => setLoss((value) => ({ ...value, note: event.target.value }))} placeholder="備註" className="min-h-14 rounded-xl bg-[#0F1115] px-4" />
          <input type="number" min="0" inputMode="decimal" value={loss.lossAmount} onChange={(event) => setLoss((value) => ({ ...value, lossAmount: event.target.value }))} placeholder="損耗金額（選填）" className="min-h-14 rounded-xl bg-[#0F1115] px-4" />
          <button type="button" onClick={submitLoss} className="min-h-14 rounded-xl bg-red-400 px-5 font-semibold text-[#0F1115]">確認損耗</button>
        </div>
      </article>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {inventoryItems.map((item) => {
          const isNoodle = item.id === "noodle";
          const isLow = Number(item.safeStock || 0) > 0 && Number(item.quantity || 0) <= Number(item.safeStock || 0);
          return (
            <article key={item.id} className={`rounded-2xl border bg-[#1A1D23] p-5 shadow-lg ${isLow ? "border-red-400/30" : "border-white/10"}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm text-[#C6A96B]">{item.unit}</p><h2 className="mt-1 text-2xl font-medium">{item.name}</h2></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLow ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  {isLow ? "⚠️ 庫存不足" : "正常"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StockValue label="目前庫存" value={item.quantity} unit={item.unit} isNoodle={isNoodle} />
                <StockValue label="安全庫存" value={item.safeStock} unit={item.unit} isNoodle={isNoodle} accent />
              </div>
              <div className="mt-4 flex gap-2"><input type="number" min="0" value={stock[item.id] || ""} onChange={(event) => setStock((values) => ({ ...values, [item.id]: event.target.value }))} placeholder={`入庫數量 ${item.unit}`} className="min-h-14 min-w-0 flex-1 rounded-xl bg-[#0F1115] px-3" /><button type="button" onClick={() => { onAddStock(item.id, stock[item.id]); setStock((values) => ({ ...values, [item.id]: "" })); }} className="min-h-14 rounded-xl bg-[#C6A96B] px-4 font-semibold text-[#0F1115]">入庫</button></div>
              <div className="mt-3 flex gap-2"><input type="number" value={adjust[item.id] || ""} onChange={(event) => setAdjust((values) => ({ ...values, [item.id]: event.target.value }))} placeholder={`調整，例如 -200 ${item.unit}`} className="min-h-14 min-w-0 flex-1 rounded-xl bg-[#0F1115] px-3" /><button type="button" onClick={() => submitAdjust(item)} className="min-h-14 rounded-xl border border-[#C6A96B]/30 px-4 font-semibold text-[#C6A96B]">調整</button></div>
              <div className="mt-3 flex gap-2"><input type="number" min="0" value={safe[item.id] || ""} onChange={(event) => setSafe((values) => ({ ...values, [item.id]: event.target.value }))} placeholder={`安全庫存 ${item.unit}`} className="min-h-14 min-w-0 flex-1 rounded-xl bg-[#0F1115] px-3" /><button type="button" onClick={() => { onSetSafeStock(item.id, safe[item.id]); setSafe((values) => ({ ...values, [item.id]: "" })); }} className="min-h-14 rounded-xl border border-white/10 px-4">設定</button></div>
            </article>
          );
        })}
      </div>

      <article className="mt-6 rounded-2xl border border-white/10 bg-[#1A1D23] p-5">
        <h2 className="text-2xl font-medium">庫存歷史</h2>
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm"><thead className="sticky top-0 bg-[#1A1D23] text-zinc-400"><tr>{["日期", "時間", "品項", "操作", "數量", "原因", "備註"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{inventoryHistory.map((record) => <tr key={record.id} className="border-t border-white/10"><td className="px-4 py-3">{record.date}</td><td className="px-4 py-3 text-zinc-400">{record.time}</td><td className="px-4 py-3">{record.ingredientName}</td><td className="px-4 py-3">{record.action}</td><td className={`px-4 py-3 font-semibold ${Number(record.quantity) < 0 ? "text-red-400" : "text-[#C6A96B]"}`}>{signed(record.quantity, record.unit)}</td><td className="px-4 py-3">{record.reason || "-"}</td><td className="px-4 py-3 text-zinc-400">{record.note || "-"}</td></tr>)}</tbody></table>
          {!inventoryHistory.length ? <div className="p-10 text-center text-zinc-500">尚無庫存異動</div> : null}
        </div>
      </article>
    </section>
  );
}
