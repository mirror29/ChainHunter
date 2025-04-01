"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// 将theme-provider直接使用next-themes库
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

// 提供一个兼容接口，以便与之前的代码兼容
export const useThemeContext = createContext({
  theme: "system" as string,
  setTheme: (theme: string) => {},
});

export function useThemeContextValue() {
  return useContext(useThemeContext);
}
