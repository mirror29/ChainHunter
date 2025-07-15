"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export function Toaster() {
  // 始终调用Hook，保持顺序一致
  const { toasts } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // 使用useEffect检测客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 在服务器端渲染或客户端渲染之前返回空组件
  if (!isMounted) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
