import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Kind = "success" | "error";
interface ToastItem { id: number; kind: Kind; message: string }
const Ctx = createContext<(kind: Kind, message: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: Kind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, kind, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} role="status"
            className={`rounded-md px-4 py-3 text-sm font-medium shadow-lg ${t.kind === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
