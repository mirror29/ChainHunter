"use client";

import { createContext, useContext } from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

// 修改ThemeProvider以接受所有next-themes属性
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// 提供一个兼容接口，以便与之前的代码兼容
export const useThemeContext = createContext({
  theme: "system" as string,
  setTheme: (theme: string) => {},
});

export function useThemeContextValue() {
  return useContext(useThemeContext);
}
