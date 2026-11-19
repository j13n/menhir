/**
 * The site follows the reader's clock: light from dawn until dusk, dark
 * through the night. The menhir animation starts at the same time of day,
 * so the page and the scene turn dark together.
 */

import { CYCLE_STEPS, DAY_STEPS, NIGHT_STEPS } from "./components/menhirFrames";

/** Local hours when the page turns light, then dark. */
export const DAWN_HOUR = 6;
export const DUSK_HOUR = 18;

export type Theme = "light" | "dark";

/** How often the theme is checked against the clock while the page is open. */
export const THEME_CHECK_MS = 60_000;

export function themeAt(date: Date): Theme {
  const hour = date.getHours();
  return hour >= DAWN_HOUR && hour < DUSK_HOUR ? "light" : "dark";
}

/**
 * The scene step that matches a moment. Sunrise in the scene is DAWN_HOUR
 * and sunset is DUSK_HOUR. Each local day, counted from dawn to dawn, is one
 * cycle, so the stone changes with the date and stays the same all night.
 */
export function sceneStepAt(date: Date): number {
  const minutesPerDay = 24 * 60;
  const daylight = (DUSK_HOUR - DAWN_HOUR) * 60;
  const sinceDawn =
    (date.getHours() - DAWN_HOUR) * 60 +
    date.getMinutes() +
    date.getSeconds() / 60;
  const minutes = ((sinceDawn % minutesPerDay) + minutesPerDay) % minutesPerDay;
  const withinCycle =
    minutes < daylight
      ? Math.floor((minutes / daylight) * DAY_STEPS)
      : DAY_STEPS +
        Math.floor(
          ((minutes - daylight) / (minutesPerDay - daylight)) * NIGHT_STEPS,
        );
  return localDayNumber(date) * CYCLE_STEPS + withinCycle;
}

/** Days since 1970-01-01 in local time, with each day starting at dawn. */
function localDayNumber(date: Date) {
  const dawnDay = new Date(date);
  dawnDay.setHours(dawnDay.getHours() - DAWN_HOUR);
  const utcMidnight = Date.UTC(
    dawnDay.getFullYear(),
    dawnDay.getMonth(),
    dawnDay.getDate(),
  );
  return Math.floor(utcMidnight / 86_400_000);
}

/**
 * Sets `data-theme` on the root element now and whenever the clock crosses
 * dawn or dusk. Returns a function that stops watching.
 */
export function watchClockTheme(root: HTMLElement = document.documentElement) {
  const apply = () => {
    root.dataset.theme = themeAt(new Date());
  };
  apply();
  const id = setInterval(apply, THEME_CHECK_MS);
  return () => clearInterval(id);
}

/**
 * The same rule as themeAt, as a script for the document head. It runs
 * before the page paints, so a reader at night never sees a white flash
 * while the app's JavaScript loads.
 */
export const themeBootScript = `(function(){var h=new Date().getHours();document.documentElement.dataset.theme=h>=${DAWN_HOUR}&&h<${DUSK_HOUR}?"light":"dark"})()`;
