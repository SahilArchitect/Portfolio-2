'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: number; message: string; tone: 'ok' | 'error' };
const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-3), { id, message, tone }]);
    setTimeout(
      () => setToasts((all) => all.filter((t) => t.id !== id)),
      tone === 'error' ? 7000 : 3500,
    );
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-3 bottom-3 left-3 z-50 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto max-w-sm rounded border px-3 py-2 text-sm shadow-sm ${
              toast.tone === 'error'
                ? 'border-red-700 bg-bg text-red-700 dark:text-red-400'
                : 'border-rule bg-bg text-fg'
            }`}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
