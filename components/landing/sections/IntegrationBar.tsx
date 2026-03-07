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
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <span className="text-xs tracking-wider text-muted-foreground/70 uppercase">
        {t("heading")}
      </span>
      <span className="hidden h-3 w-px bg-border sm:inline-block" />
      {integrations.map(({ name, icon: Icon }) => (
        <span key={name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon size={16} />
          <span>{name}</span>
        </span>
      ))}
      <span className="text-sm text-muted-foreground/60">{t("andMore")}</span>
    </div>
  );
}
