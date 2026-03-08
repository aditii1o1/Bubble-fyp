import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToastHost from "../components/common/ToastHost";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback((message, options = {}) => {
    const id = Date.now();
    const durationMs = options.durationMs || 2600;
    const type = options.type || "info"; // info | error | success

    setToast({ id, message: String(message || ""), type });

    setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast: show, hideToast: hide }), [hide, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toast={toast} onHide={hide} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

