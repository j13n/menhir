// The looks of Menhir's styling skill. Each folder here holds a look's
// tokens.css, LOOK.md and LICENSE, and a look in plain CSS also the CSS
// modules its examples share and its tokens.tailwind.css;
// src/examples/<slug>/<look>/ holds its worked examples.
// website/styling-skill.ts copies them into the skill.

/** How an example is styled, which decides what the site shows it with. */
export type Styling = "tailwind" | "css";

/** A look, as the component pages offer it beside Tailwind CSS and CSS. */
export type Look = {
  /** Its folder here, and the value of data-look: lowercase letters, digits and dashes. */
  name: string;
  label: string;
  /**
   * How its examples are styled: "tailwind" examples are shown with the
   * site's Tailwind preflight, "css" ones without the site's styles.
   */
  styling: Styling;
};

export const looks = [
  { name: "shadcn", label: "shadcn", styling: "tailwind" },
  { name: "bootstrap", label: "Bootstrap", styling: "css" },
] as const satisfies readonly Look[];

export type LookName = (typeof looks)[number]["name"];
