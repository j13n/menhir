/**
 * The example's themes and options. On this site `data-theme` holds the
 * color mode, so the example writes `data-example-theme`, under its own
 * storage key. In an app of your own, the defaults do.
 */
export const themeOptions = {
  themes: ["paper", "slate", "forest"],
  defaultTheme: "paper",
  storageKey: "menhir-example-theme",
  attribute: "data-example-theme",
} as const;
