"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { LanguageToggleButton } from "@/components/language-toggle";

export function SidebarFooterControls() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const value = mounted ? resolvedTheme : null;

  return (
    <div className="flex w-full items-center gap-2">
      <LanguageToggleButton />
      <button
        className="ms-auto inline-flex items-center border p-1"
        aria-label="Toggle Theme"
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
        data-theme-toggle=""
      >
        {[
          ["light", Sun],
          ["dark", Moon],
        ].map(([key, Icon]) => (
          <Icon
            key={key as string}
            fill="currentColor"
            className={cn(
              "size-6.5 p-1.5",
              value === key
                ? "bg-fd-accent text-fd-accent-foreground"
                : "text-fd-muted-foreground",
            )}
          />
        ))}
      </button>
    </div>
  );
}
