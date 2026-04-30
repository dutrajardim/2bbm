import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeContextValue, type ThemeMode } from "./themeContext";

const THEME_STORAGE_KEY = "2bbm_theme";

/**
 * Resolves whether dark mode should be active for the selected theme mode.
 *
 * @param theme - User-selected theme mode.
 * @returns True when the document should receive the dark class.
 */
const shouldUseDarkTheme = (theme: ThemeMode) => {
  if (theme === "dark") return true;
  if (theme === "light") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Provides application theme state and keeps the document class synchronized.
 *
 * @param props.children - Application content that can read or update the theme.
 * @returns Theme context provider.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
      ? savedTheme
      : "system";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    /**
     * Applies the selected theme mode to the document root.
     */
    const applyTheme = () => {
      document.documentElement.classList.toggle("dark", shouldUseDarkTheme(theme));
      document.documentElement.style.colorScheme = shouldUseDarkTheme(theme) ? "dark" : "light";
    };

    applyTheme();
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: (nextTheme) => {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
    },
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
