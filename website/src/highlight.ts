// Code highlighting with TanStack Highlight, done when the site is built.
// vite-plugin-highlight.ts replaces each tag below, and each `?highlight`
// import, with the result of `highlight`, so no page ships the highlighter:
// pages get the tokens as data and CodeBlock renders them.
// Without the plugin, as in the Node code that reads src/componentDocs/,
// the tags highlight as they run.

import {
  createHighlighter,
  type Highlighter,
  type HighlightTokenClass,
} from "@tanstack/highlight/core";
import { css as cssLanguage } from "@tanstack/highlight/languages/css";
import { shell as shellLanguage } from "@tanstack/highlight/languages/shell";
import { ts as tsLanguage } from "@tanstack/highlight/languages/ts";
import { tsx as tsxLanguage } from "@tanstack/highlight/languages/tsx";

export type Language = "css" | "shell" | "ts" | "tsx";

/** Plain text, or a token's class and text: `["keyword", "const"]`. */
export type Token = string | [className: HighlightTokenClass, text: string];

/** Source code as tokens, for CodeBlock to render. They hold all its text. */
export type Highlighted = { lang: Language; tokens: Token[] };

// Made on first use, so a page that imports a tag the plugin has replaced
// keeps none of this module.
let highlighter: Highlighter | undefined;

export function highlight(code: string, lang: Language): Highlighted {
  highlighter ??= createHighlighter({
    languages: [cssLanguage, shellLanguage, tsLanguage, tsxLanguage],
  });
  const tokens = highlighter
    .tokenize(code, { lang })
    .tokens.map(({ className, value }): Token =>
      className ? [className, value] : value,
    );
  return { lang, tokens };
}

/** The code the tokens were made from. */
export function codeOf(highlighted: Highlighted): string {
  return highlighted.tokens
    .map((token) => (typeof token === "string" ? token : token[1]))
    .join("");
}

/** A template tag. The `never` rejects `${}`: the code must be known when the site is built. */
type Tag = (
  strings: TemplateStringsArray,
  ...interpolations: never[]
) => Highlighted;

// One tag per language: css`a { color: red; }`.
export const css: Tag = (strings) => highlight(strings[0], "css");
export const shell: Tag = (strings) => highlight(strings[0], "shell");
export const ts: Tag = (strings) => highlight(strings[0], "ts");
export const tsx: Tag = (strings) => highlight(strings[0], "tsx");
