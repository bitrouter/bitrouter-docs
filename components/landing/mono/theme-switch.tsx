"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = ["light", "dark", "system"] as const;

/** Terminal-styled 3-way theme switch: [light] [dark] [system]. */
export function MonoThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="footer-theme" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => {
        const active = mounted && theme === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setTheme(opt)}
            className={"footer-theme-opt" + (active ? " on" : "")}
            aria-pressed={active}
          >
            [{opt}]
          </button>
        );
      })}
    </div>
  );
}
