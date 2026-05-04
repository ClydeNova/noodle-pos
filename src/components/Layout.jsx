export function Layout({ activeView, onViewChange, children, contentClassName = "" }) {
  const buttonClass = (view) =>
    [
      "h-10 rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/40",
      activeView === view
        ? "bg-[#C6A96B] text-[#0F1115] shadow-[0_0_24px_rgba(198,169,107,0.18)]"
        : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
    ].join(" ");

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#0F1115] text-zinc-50">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#C6A96B]/15 bg-[#111217] px-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] lg:px-8">
        <div>
          <h1 className="text-lg font-medium tracking-[0.12em] text-zinc-50">
            一碗四季 - 過嶺店
          </h1>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.22em] text-[#C6A96B]/75">
            Noodle Shop POS
          </p>
        </div>

        <div className="flex rounded-full border border-white/10 bg-[#0F1115]/80 p-1 shadow-inner shadow-black/40">
          <button
            type="button"
            className={buttonClass("pos")}
            onClick={() => onViewChange("pos")}
          >
            POS
          </button>
          <button
            type="button"
            className={buttonClass("analytics")}
            onClick={() => onViewChange("analytics")}
          >
            報表
          </button>
        </div>
      </header>

      <div className={`min-h-0 flex-1 ${contentClassName}`}>{children}</div>
    </main>
  );
}
