import type { ComponentProps } from "react";
import {
  DiscordIcon,
  GitHubIcon,
  HuggingFaceIcon,
  LinkedInIcon,
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
  {
    label: "Hugging Face",
    href: "https://huggingface.co/BitRouterAI",
    icon: HuggingFaceIcon,
  },
  { label: "Twitter/X", href: "https://x.com/BitRouterAI", icon: XIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bitrouterai",
    icon: LinkedInIcon,
  },
];
