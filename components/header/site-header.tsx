"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "fumadocs-ui/components/ui/navigation-menu";
import { GitHubStarsBadge } from "@/components/landing/github-stars-badge";
import { socialHref } from "@/components/landing/social-links";
import { NAV_ITEMS, isNavItemActive } from "./nav-config";
import "./site-header.css";

export interface SiteHeaderProps {
  pathname?: string;
  leadingSlot?: ReactNode;
  searchSlot?: ReactNode;
}

export function Brand() {
  return <a className="site-brand" href="/" aria-label="BitRouter home"><span aria-hidden="true" />bitrouter.</a>;
}

function CommunityLinks() {
  return <div className="site-community" role="group" aria-label="Community">
    <a href={socialHref("x")} aria-label="BitRouter on Twitter/X" title="Twitter/X" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
    <a href={socialHref("discord")} aria-label="Join BitRouter on Discord" title="Discord" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4a20 20 0 0 0-4.9-1.5l-.6 1.2a18 18 0 0 0-5.5 0l-.6-1.2a20 20 0 0 0-5 1.5C.6 9-.3 13.6.1 18.1a20 20 0 0 0 6 3l1.3-2.1-1.9-.9.4-.3a15 15 0 0 0 12.1 0l.4.3-1.9.9 1.2 2.1a20 20 0 0 0 6-3c.5-5.2-.8-9.7-3.5-13.7ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg></a>
    <GitHubStarsBadge />
  </div>;
}

/** Shared by marketing pages and the native Fumadocs notebook header. */
export function SiteHeaderBody({ pathname, leadingSlot, searchSlot }: SiteHeaderProps) {
  const [menu, setMenu] = useState("");
  const isDocs = Boolean(searchSlot);

  useEffect(() => {
    const desktop = window.matchMedia(isDocs ? "(min-width:1101px)" : "(min-width:1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenu(""); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [isDocs]);

  return <NavigationMenu value={menu} onValueChange={setMenu} asChild aria-label="Site navigation">
    <div className={`site-navigation ${isDocs ? "site-navigation-docs" : ""}`}>
      <NavigationMenuList asChild>
        <div className={`site-header-body ${isDocs ? "site-header-docs" : ""}`}>
          {leadingSlot && <div className="site-docs-trigger">{leadingSlot}</div>}
          <Brand />
          <nav className="site-primary-nav" aria-label="Main navigation">{NAV_ITEMS.map(item => <a key={item.key} href={item.webPath} aria-current={isNavItemActive(pathname, item) ? "page" : undefined}>{item.label}</a>)}</nav>
          <div className="site-header-tools">
            {searchSlot}
            <div className="site-desktop-community"><CommunityLinks /></div>
            <a className="site-download" href="https://github.com/bitrouter/bitrouter/releases/latest"><Download size={15} aria-hidden="true" /><span>Download</span></a>
            <NavigationMenuItem value="mobile" asChild>
              <div className="site-menu-item">
                <NavigationMenuTrigger className="site-menu-trigger" aria-label={menu ? "Close navigation" : "Open navigation"} onPointerMove={event => event.preventDefault()} onPointerLeave={event => event.preventDefault()}>
                  {menu ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="site-menu-content" onPointerEnter={event => event.preventDefault()} onPointerLeave={event => event.preventDefault()}>
                  <div className="site-menu-inner">
                    <nav className="site-mobile-primary" aria-label="Mobile navigation">{NAV_ITEMS.map(item => <NavigationMenuLink key={item.key} asChild active={isNavItemActive(pathname, item)}>
                      <a href={item.webPath} aria-current={isNavItemActive(pathname, item) ? "page" : undefined} onClick={() => setMenu("")}>{item.label}</a>
                    </NavigationMenuLink>)}</nav>
                    <div className="site-menu-community" onClick={event => { if ((event.target as HTMLElement).closest("a")) setMenu(""); }}><CommunityLinks /></div>
                  </div>
                </NavigationMenuContent>
              </div>
            </NavigationMenuItem>
          </div>
        </div>
      </NavigationMenuList>
      <NavigationMenuViewport className="site-menu-viewport" />
    </div>
  </NavigationMenu>;
}

export function SiteHeader(props: SiteHeaderProps) {
  return <><a className="site-skip-link" href="#main">Skip to content</a><header className="site-header"><SiteHeaderBody {...props} /></header></>;
}
