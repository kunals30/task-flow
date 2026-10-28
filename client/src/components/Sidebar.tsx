interface Props { open: boolean; onClose: () => void }

export function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-brand-600 text-sm font-bold text-white">T</div>
          <span className="text-lg font-semibold text-slate-900">TaskFlow</span>
        </div>
        <nav className="p-3 text-sm">
          <a href="#" className="flex items-center gap-3 rounded-md bg-brand-50 px-3 py-2 font-medium text-brand-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </a>
        </nav>
      </aside>
    </>
  );
}
