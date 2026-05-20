export type TreeTheme = "dark" | "light";

export const TREE_THEME_STORAGE_KEY = "beiza_tree_theme";

export function readStoredTreeTheme(): TreeTheme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(TREE_THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function storeTreeTheme(theme: TreeTheme) {
  localStorage.setItem(TREE_THEME_STORAGE_KEY, theme);
}
