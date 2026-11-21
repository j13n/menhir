import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  DAWN_HOUR,
  DUSK_HOUR,
  THEME_CHECK_MS,
  themeAt,
  themeBootScript,
  watchClockTheme,
} from "./timeOfDay";

/** A local time on 19 November 2026. */
const at = (hours: number, minutes = 0) =>
  new Date(2026, 10, 19, hours, minutes);

describe("themeAt", () => {
  test("is light from dawn until dusk and dark otherwise", () => {
    expect(themeAt(at(DAWN_HOUR - 1, 59))).toBe("dark");
    expect(themeAt(at(DAWN_HOUR))).toBe("light");
    expect(themeAt(at(12))).toBe("light");
    expect(themeAt(at(DUSK_HOUR - 1, 59))).toBe("light");
    expect(themeAt(at(DUSK_HOUR))).toBe("dark");
    expect(themeAt(at(0))).toBe("dark");
  });
});

describe("watchClockTheme", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("sets the theme now, and turns dark when the clock passes dusk", () => {
    vi.setSystemTime(at(DUSK_HOUR - 1, 58));
    const root = document.createElement("html");
    const stop = watchClockTheme(root);
    expect(root.dataset.theme).toBe("light");

    vi.advanceTimersByTime(THEME_CHECK_MS);
    expect(root.dataset.theme).toBe("light");
    vi.advanceTimersByTime(THEME_CHECK_MS);
    expect(root.dataset.theme).toBe("dark");

    stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("sets the document's root element by default", () => {
    vi.setSystemTime(at(3));
    const stop = watchClockTheme();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    stop();
    delete document.documentElement.dataset.theme;
  });
});

describe("themeBootScript", () => {
  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset.theme;
  });

  test("picks the same theme as themeAt, before the app loads", () => {
    vi.useFakeTimers();
    for (const hour of [
      0,
      DAWN_HOUR - 1,
      DAWN_HOUR,
      12,
      DUSK_HOUR - 1,
      DUSK_HOUR,
      23,
    ]) {
      vi.setSystemTime(at(hour));
      new Function(themeBootScript)();
      expect(document.documentElement.dataset.theme, `${hour}:00`).toBe(
        themeAt(at(hour)),
      );
    }
  });
});
