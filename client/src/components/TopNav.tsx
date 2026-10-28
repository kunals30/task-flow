interface Props { onMenu: () => void; onNewTask: () => void }

export function TopNav({ onMenu, onNewTask }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="hidden text-xs text-slate-500 sm:block">Track and manage your team's work</p>
        </div>
      </div>
      <button className="btn-primary" onClick={onNewTask}>
        <span className="text-base leading-none">+</span> New task
      </button>
    </header>
  );
}
