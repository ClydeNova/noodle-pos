const tabs = [
  { id: "pos", label: "POS" },
  { id: "expenses", label: "支出" },
  { id: "analytics", label: "統計" },
  { id: "inventory", label: "庫存" }
];

export function Layout({ activeView, onViewChange, children, contentClassName = "" }) {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0F1115] text-zinc-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#C6A96B]/15 bg-[#111217] px-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)] lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-base font-medium tracking-[0.08em] text-zinc-50 sm:text-lg">一碗四季 - 過嶺店</h1>
          <p className="hidden text-xs uppercase tracking-[0.22em] text-[#C6A96B]/75 sm:block">Restaurant OS</p>
        </div>
        <nav className="flex rounded-full border border-white/10 bg-[#0F1115]/80 p-1">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => onViewChange(tab.id)}
              className={`min-h-11 rounded-full px-3 text-sm font-medium transition sm:px-5 ${activeView === tab.id ? "bg-[#C6A96B] text-[#0F1115]" : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <div className={`min-h-0 flex-1 ${contentClassName}`}>{children}</div>
    </main>
  );
}
