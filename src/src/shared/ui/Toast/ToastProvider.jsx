import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToastContext } from './ToastContext';
import './Toast.css';

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 3500;
let nextToastId = 1;

/**
 * Short, self-closing messages ("Added to cart", "Only 3 in stock").
 * Screen readers: success → role="status" (polite), error → role="alert" (assertive).
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message, duration = DEFAULT_DURATION) => {
      const id = nextToastId++;
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, type, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(
    () => ({
      success: (message, duration) => show('success', message, duration),
      error: (message, duration) => show('error', message, duration),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <span>{t.message}</span>
            <button type="button" className="toast__close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
