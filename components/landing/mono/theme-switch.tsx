"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Monitor],
] as const;

/** Segmented icon theme switch (light / dark / system) — matches the site's
 *  bordered theme toggle, styled with the footer's mono tokens. */
export function MonoThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="footer-theme" role="group" aria-label="Theme">
      {OPTIONS.map(([opt, Icon]) => {
        const active = mounted && theme === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setTheme(opt)}
            className={"footer-theme-opt" + (active ? " on" : "")}
            aria-label={opt}
            aria-pressed={active}
          >
            <Icon className="footer-theme-ico" />
          </button>
        );
      })}
    </div>
  );
}
