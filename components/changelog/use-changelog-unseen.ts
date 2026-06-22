"use client";

import { useEffect, useState } from "react";
import { LATEST_CHANGELOG_DATE } from "@/lib/changelog-latest";

export const CHANGELOG_SEEN_KEY = "lastSeenChangelog";
export const CHANGELOG_SEEN_EVENT = "changelog-seen";

// True when there is a changelog entry newer than the user's last visit
// (or they have never visited). Updates live when the changelog is opened.
export function useChangelogUnseen(): boolean {
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    const compute = () => {
      if (!LATEST_CHANGELOG_DATE) {
        setUnseen(false);
        return;
      }
      const seen = localStorage.getItem(CHANGELOG_SEEN_KEY);
      setUnseen(!seen || new Date(LATEST_CHANGELOG_DATE) > new Date(seen));
    };
    compute();
    window.addEventListener(CHANGELOG_SEEN_EVENT, compute);
    return () => window.removeEventListener(CHANGELOG_SEEN_EVENT, compute);
  }, []);

  return unseen;
}
