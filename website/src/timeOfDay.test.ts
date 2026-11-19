import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CYCLE_STEPS, sceneFrame } from "./components/menhirFrames";
import {
  DAWN_HOUR,
  DUSK_HOUR,
  sceneStepAt,
  THEME_CHECK_MS,
  themeAt,
  themeBootScript,
  watchClockTheme,
} from "./timeOfDay";

/** A local time on 19 November 2026. */
const at = (hours: number, minutes = 0, day = 19) =>
  new Date(2026, 10, day, hours, minutes);

/** Every minute of one local day. */
const everyMinute = Array.from({ length: 24 * 60 }, (_, m) =>
  at(Math.floor(m / 60), m % 60),
);

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

describe("sceneStepAt", () => {
  test("the scene shows night exactly when the page is dark", () => {
    for (const date of everyMinute) {
      const phase = sceneFrame(sceneStepAt(date)).phase;
      expect(phase === "night", date.toString()).toBe(themeAt(date) === "dark");
    }
  });

  test("the sun rises at dawn, is overhead at midday and sets at dusk", () => {
    const step = (date: Date) => sceneStepAt(date) % CYCLE_STEPS;
    expect(step(at(DAWN_HOUR))).toBe(0);
    expect(sceneFrame(sceneStepAt(at(12))).shadow).toBe("none");
    expect(sceneFrame(sceneStepAt(at(DUSK_HOUR, -1))).phase).toBe("day");
    expect(sceneFrame(sceneStepAt(at(DUSK_HOUR))).phase).toBe("night");
  });

  test("moves forward through the day, one frame at a time or less", () => {
    for (let i = 1; i < everyMinute.length; i++) {
      const gap = sceneStepAt(everyMinute[i]) - sceneStepAt(everyMinute[i - 1]);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(1);
    }
  });

  test("the same stone stands from one dawn to the next", () => {
    const stone = (date: Date) => sceneFrame(sceneStepAt(date)).stone;
    const today = stone(at(DAWN_HOUR));
    expect(stone(at(23, 59))).toBe(today);
    expect(stone(at(DAWN_HOUR - 1, 59, 20))).toBe(today);
    expect(stone(at(DAWN_HOUR, 0, 20))).not.toBe(today);
  });

  test("tomorrow's dawn follows straight on from tonight", () => {
    const lastNight = sceneStepAt(at(DAWN_HOUR - 1, 59, 20));
    const dawn = sceneStepAt(at(DAWN_HOUR, 0, 20));
    expect(dawn - lastNight).toBe(1);
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
