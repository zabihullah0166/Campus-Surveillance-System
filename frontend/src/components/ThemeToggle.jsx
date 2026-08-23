import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      className="theme-toggle"
      onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      title={`Switch to ${isLight ? "dark" : "light"} theme`}
      type="button"
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
