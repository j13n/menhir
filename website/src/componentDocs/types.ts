// Plain data, no JSX: the component pages render it, and
// vite-plugin-component-markdown.ts turns the same data into each page's
// Markdown version.

import type { Highlighted } from "../highlight";

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export type PartApi = {
  part: string;
  description: string;
  props: PropRow[];
};

export type KeyboardRow = {
  keys: string;
  action: string;
};

/** A source file of an example, shown as code. */
export type CodeFile = { name: string; code: string };

/** What a component page says about its component. */
export type ComponentDoc = {
  /** The entry point's name: `menhir/<slug>`, at `/docs/components/<slug>`. */
  slug: string;
  /** Display name, such as "Switch". */
  name: string;
  description: string;
  /** The parts as TSX, from the tsx tag of src/highlight.ts. */
  anatomy: Highlighted;
  api: PartApi[];
  keyboard: KeyboardRow[];
};
