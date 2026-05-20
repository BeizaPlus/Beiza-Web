import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  readStoredTreeTheme,
  storeTreeTheme,
  type TreeTheme,
} from "@/lib/legacy/treeTheme";

type TreeThemeContextValue = {
  theme: TreeTheme;
  isLight: boolean;
  setTheme: (theme: TreeTheme) => void;
  toggleTheme: () => void;
};

const TreeThemeContext = createContext<TreeThemeContextValue | null>(null);

export function TreeThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<TreeTheme>(readStoredTreeTheme);

  const setTheme = useCallback((next: TreeTheme) => {
    setThemeState(next);
    storeTreeTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      storeTreeTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === "light",
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <TreeThemeContext.Provider value={value}>{children}</TreeThemeContext.Provider>;
}

export function useTreeTheme() {
  const ctx = useContext(TreeThemeContext);
  if (!ctx) {
    throw new Error("useTreeTheme must be used within TreeThemeProvider");
  }
  return ctx;
}
