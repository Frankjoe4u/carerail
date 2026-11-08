"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";

type Theme = "dark" | "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("cr-theme", next);
    } catch {
      /* storage blocked: the choice lasts until the page closes */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={`grid size-11 place-items-center rounded-full border border-line bg-surface text-fg transition-transform active:scale-90 hover:border-primary ${className}`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
