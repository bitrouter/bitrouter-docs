import type { ComponentProps } from "react";
import {
  DiscordIcon,
  GitHubIcon,
  RedditIcon,
  TelegramIcon,
  XIcon,
} from "@/components/icons";

export type SocialLink = {
  label: string;
  href: string;
  icon: (props: ComponentProps<"svg">) => React.ReactElement;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/bitrouter", icon: GitHubIcon },
  { label: "Discord", href: "https://discord.gg/G3zVrZDa5C", icon: DiscordIcon },
  { label: "Telegram", href: "https://t.me/bitrouterai", icon: TelegramIcon },
  { label: "Reddit", href: "https://www.reddit.com/r/bitrouter/", icon: RedditIcon },
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", icon: XIcon },
];
