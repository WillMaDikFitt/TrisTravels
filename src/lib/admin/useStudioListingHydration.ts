"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Studio catalogue editors MUST use this pattern.
 *
 * Bug we hit: uncontrolled inputs with defaultValue were primed from seed,
 * then Firestore loaded into React state without remounting the form.
 * Saving wrote seed back over real Studio edits.
 *
 * Rules:
 * 1. Do not mount the form until remote load finishes (hydrated === true).
 * 2. Start row as null for existing listings (never paint seed into inputs first).
 * 3. Remount the form with editorEpoch whenever loaded or saved content changes.
 * 4. Refuse save while !hydrated.
 */
export function useStudioListingHydration<T>(options: {
  isNew: boolean;
  slugKey: string;
  load: () => Promise<T | null | undefined>;
  isRemoved?: (row: T) => boolean;
  blank: () => T;
  /** Only used when Firestore has no usable doc yet. */
  seedFallback?: () => T | null | undefined;
}) {
  const { isNew, slugKey, load, isRemoved, blank, seedFallback } = options;
  const [row, setRow] = useState<T | null>(() => (isNew ? blank() : null));
  const [hydrated, setHydrated] = useState(isNew);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (isNew) {
      setRow(blank());
      setHydrated(true);
      setLoadError("");
      setEditorEpoch((n) => n + 1);
      return;
    }

    let cancelled = false;
    setHydrated(false);
    setRow(null);
    setLoadError("");

    load()
      .then((remote) => {
        if (cancelled) return;
        if (remote && isRemoved?.(remote)) {
          setRow(null);
          setLoadError("This listing was removed from the catalogue.");
          setHydrated(true);
          return;
        }
        if (remote) {
          setRow(remote);
        } else {
          const seeded = seedFallback?.();
          setRow(seeded ?? blank());
        }
        setEditorEpoch((n) => n + 1);
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        const seeded = seedFallback?.();
        setRow(seeded ?? blank());
        setEditorEpoch((n) => n + 1);
        setHydrated(true);
        setLoadError("Could not reach live data — showing local fallback. Do not save unless you are sure.");
      });

    return () => {
      cancelled = true;
    };
    // Intentionally depend on slug identity only; load/blank are stable enough per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, slugKey]);

  const bumpEpoch = useCallback(() => {
    setEditorEpoch((n) => n + 1);
  }, []);

  const applySaved = useCallback((next: T) => {
    setRow(next);
    setEditorEpoch((n) => n + 1);
  }, []);

  return {
    row,
    setRow,
    hydrated,
    editorEpoch,
    formKey: `${slugKey}-${editorEpoch}`,
    loadError,
    canSave: hydrated && Boolean(row),
    bumpEpoch,
    applySaved,
  };
}
