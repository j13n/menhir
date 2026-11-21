import { vi } from "vitest";

import { darkQuery } from "../../src/color-mode/colorMode.ts";

/**
 * Replaces `matchMedia` with one whose dark-mode query the test controls.
 * jsdom has no `matchMedia`, and a real browser's follows the machine.
 * Undo with `vi.unstubAllGlobals()`.
 */
export function stubSystemPreference(dark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    matches: dark,
    media: darkQuery,
    addEventListener: (_: string, listener: (e: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (
      _: string,
      listener: (e: MediaQueryListEvent) => void,
    ) => listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => {
      if (query !== darkQuery) throw new Error(`Unexpected query ${query}`);
      return media;
    }),
  );
  return {
    listeners,
    /** Changes the preference and tells the listeners, as the system would. */
    set(next: boolean) {
      media.matches = next;
      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}
