"use client";

import { useChangelogUnseen } from "@/components/changelog/use-changelog-unseen";

/** Changelog layout-tab label, including the existing new-release signal. */
export function ChangelogTabLabel() {
  const unseen = useChangelogUnseen();

  return (
    <>
      Changelog
      {unseen ? (
        <span
          className="ml-1.5 inline-block size-1.5 rounded-full bg-[var(--z-blue)] align-middle"
          aria-label="New releases"
        />
      ) : null}
    </>
  );
}
