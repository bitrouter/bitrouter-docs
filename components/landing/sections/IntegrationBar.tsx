import ClaudeCode from "@lobehub/icons/es/ClaudeCode";
import OpenClaw from "@lobehub/icons/es/OpenClaw";
import OpenCode from "@lobehub/icons/es/OpenCode";
import { getTranslations } from "next-intl/server";

const integrations = [
  { name: "OpenClaw", icon: OpenClaw.Color },
  { name: "OpenCode", icon: OpenCode },
  { name: "Claude Code", icon: ClaudeCode.Color },
] as const;

export async function IntegrationBar() {
  const t = await getTranslations("IntegrationBar");

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5 sm:gap-y-2">
      <span className="text-[10px] tracking-wider text-muted-foreground/70 uppercase sm:text-xs">
        {t("heading")}
      </span>
      <span className="hidden h-3 w-px bg-border sm:inline-block" />
      {integrations.map(({ name, icon: Icon }) => (
        <span key={name} className="flex items-center gap-1 text-xs text-muted-foreground sm:gap-1.5 sm:text-sm">
          <Icon size={14} className="sm:size-4" />
          <span>{name}</span>
        </span>
      ))}
      <span className="text-xs text-muted-foreground/60 sm:text-sm">{t("andMore")}</span>
    </div>
  );
}
