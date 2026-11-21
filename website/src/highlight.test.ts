import { describe, expect, test } from "vitest";

import { codeOf, css, highlight, type Language } from "./highlight";

/** Every example's files, as the pages import them with `?highlight`. */
const examples = import.meta.glob<string>("./examples/**/*.{css,ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

const languages: Record<string, Language> = {
  css: "css",
  ts: "ts",
  tsx: "tsx",
};

describe("highlight", () => {
  test("keeps every character of each example in its tokens", () => {
    const files = Object.entries(examples);
    expect(files.length).toBeGreaterThan(0);
    for (const [path, code] of files) {
      const lang = languages[path.split(".").pop()!];
      expect(codeOf(highlight(code, lang)), path).toBe(code);
    }
  });

  test("gives each token its class", () => {
    expect(css`a { color: red; }`.tokens).toContainEqual(["property", "color"]);
  });
});
