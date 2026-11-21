import type { HighlightTheme } from "@tanstack/highlight/theme";

// The site's code colours: Tailwind's stone for text and punctuation, as on
// the rest of the site, and six muted, earthy tints for the tokens. Each
// colour has a contrast of at least 4.5:1 on the code block's background
// (stone-200/60 over stone-50, and stone-900).

type Tints = Record<
  | "text"
  | "muted"
  | "comment"
  | "clay"
  | "ochre"
  | "moss"
  | "sage"
  | "slate"
  | "heather",
  string
>;

const light: Tints = {
  text: "oklch(26.8% 0.007 34.3)", // stone-800
  muted: "oklch(44.4% 0.011 73.6)", // stone-600
  comment: "oklch(52% 0.013 58)", // between stone-500 and stone-600
  clay: "oklch(50% 0.11 40)",
  ochre: "oklch(50% 0.09 75)",
  moss: "oklch(48% 0.08 135)",
  sage: "oklch(48% 0.06 190)",
  slate: "oklch(47% 0.07 250)",
  heather: "oklch(47% 0.08 320)",
};

const dark: Tints = {
  text: "oklch(92.3% 0.003 48.7)", // stone-200
  muted: "oklch(70.9% 0.01 56.3)", // stone-400
  comment: "oklch(68% 0.01 56)",
  clay: "oklch(74% 0.09 40)",
  ochre: "oklch(78% 0.08 80)",
  moss: "oklch(76% 0.07 135)",
  sage: "oklch(76% 0.05 190)",
  slate: "oklch(75% 0.06 250)",
  heather: "oklch(75% 0.07 320)",
};

/** Which tint each token class takes. */
function theme(
  name: string,
  type: "light" | "dark",
  background: string,
  tint: Tints,
): HighlightTheme {
  return {
    name,
    type,
    background,
    foreground: tint.text,
    tokens: {
      token: tint.text,
      variable: tint.text,
      comment: tint.comment,
      meta: tint.muted,
      operator: tint.muted,
      keyword: tint.clay,
      command: tint.clay,
      heading: tint.clay,
      deleted: tint.clay,
      string: tint.moss,
      inserted: tint.moss,
      number: tint.ochre,
      literal: tint.ochre,
      "code-inline": tint.ochre,
      type: tint.sage,
      tag: tint.slate,
      selector: tint.slate,
      function: tint.slate,
      link: tint.slate,
      attr: tint.heather,
      property: tint.heather,
    },
  };
}

export const menhirLight = theme(
  "menhir-light",
  "light",
  "oklch(92.3% 0.003 48.7 / 0.6)",
  light,
);
export const menhirDark = theme(
  "menhir-dark",
  "dark",
  "oklch(21.6% 0.006 56)",
  dark,
);
