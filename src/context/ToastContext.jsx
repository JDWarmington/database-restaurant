import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'success', duration = 3200) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const api = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error', 4500),
    info: (msg) => push(msg, 'info'),
    warning: (msg) => push(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`} role="status">
            <span className="toast__icon" aria-hidden="true">
              {t.variant === 'success' && '✓'}
              {t.variant === 'error' && '!'}
              {t.variant === 'warning' && '⚠'}
              {t.variant === 'info' && 'i'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
