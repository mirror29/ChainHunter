"use client";

import { useState, createContext, useContext } from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToastType = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const ToastContext = createContext<{
  toasts: ToastType[];
  addToast: (props: Omit<ToastType, "id">) => void;
  updateToast: (id: string, props: Partial<ToastType>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (props: Omit<ToastType, "id">) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { ...props, id: Math.random().toString(36).substring(2, 9) },
    ]);
  };

  const updateToast = (id: string, props: Partial<ToastType>) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...props } : toast
      )
    );
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        updateToast,
        removeToast,
        removeAllToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
