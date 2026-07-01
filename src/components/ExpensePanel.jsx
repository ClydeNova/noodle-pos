import { useState } from "react";
import { expenseCategories } from "../hooks/useExpenses.js";

const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; };
const emptyForm = () => ({ date: today(), category: expenseCategories[0], item: "", amount: "", note: "" });

export function ExpensePanel({ expenses, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (editingId) { onUpdate(editingId, form); setEditingId(null); setForm(emptyForm()); return; }
    if (onAdd(form)) setForm(emptyForm()); else window.alert("請完整填寫日期、類別、項目與正確金額");
  };
  const edit = (record) => { setEditingId(record.id); setForm({ date: record.date, category: record.category, item: record.item, amount: record.amount, note: record.note || "" }); };
  const remove = (record) => { if (window.confirm(`確定刪除「${record.item}」支出紀錄？`)) onDelete(record.id); };
  return <section className="mx-auto w-full max-w-7xl pb-8"><div className="mb-6"><p className="text-sm tracking-[0.2em] text-[#C6A96B]/75">EXPENSES</p><h1 className="mt-1 text-4xl font-medium">支出管理</h1></div>
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-[#1A1D23] p-5 md:grid-cols-2 xl:grid-cols-5">
      <input type="date" value={form.date} onChange={(e)=>change("date",e.target.value)} className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4" />
      <select value={form.category} onChange={(e)=>change("category",e.target.value)} className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4">{expenseCategories.map((category)=><option key={category}>{category}</option>)}</select>
      <input value={form.item} onChange={(e)=>change("item",e.target.value)} placeholder="支出項目" className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4" />
      <input type="number" min="1" inputMode="decimal" value={form.amount} onChange={(e)=>change("amount",e.target.value)} placeholder="金額" className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4" />
      <button className="min-h-14 rounded-xl bg-[#C6A96B] font-semibold text-[#0F1115]">{editingId ? "儲存修改" : "新增支出"}</button>
      <input value={form.note} onChange={(e)=>change("note",e.target.value)} placeholder="備註（選填）" className="min-h-14 rounded-xl border border-white/10 bg-[#0F1115] px-4 md:col-span-2 xl:col-span-5" />
    </form>
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#1A1D23]"><div className="max-h-[52vh] overflow-y-auto"><table className="w-full min-w-[720px] text-left"><thead className="sticky top-0 bg-[#111217] text-sm text-zinc-400"><tr>{["日期","類別","項目","金額","備註","操作"].map((label)=><th key={label} className="px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{expenses.map((record)=><tr key={record.id} className="border-t border-white/10"><td className="px-5 py-4">{record.date}</td><td className="px-5 py-4 text-[#C6A96B]">{record.category}</td><td className="px-5 py-4">{record.item}</td><td className="px-5 py-4 font-semibold">${Number(record.amount).toLocaleString("zh-TW")}</td><td className="px-5 py-4 text-zinc-400">{record.note || "-"}</td><td className="px-5 py-4"><button type="button" onClick={()=>edit(record)} className="min-h-11 px-3 text-[#C6A96B]">編輯</button><button type="button" onClick={()=>remove(record)} className="min-h-11 px-3 text-red-300">刪除</button></td></tr>)}</tbody></table>{!expenses.length?<div className="p-12 text-center text-zinc-500">尚無支出紀錄</div>:null}</div></div>
  </section>;
}
