/**
 * The site follows the reader's clock: light from dawn until dusk, dark
 * through the night.
 */

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
