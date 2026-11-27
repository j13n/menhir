// @vitest-environment node
import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { codeOf, css, highlight, type Language } from "./highlight";

const examplesDir = fileURLToPath(new URL("./examples", import.meta.url));

/**
 * Every example's files, as the pages import them with `?highlight`. Read
 * from disk: under Vitest a `*.module.css?raw` import is the module's class
 * names, not its text.
 */
const examples = Object.fromEntries(
  globSync("**/*.{css,ts,tsx}", { cwd: examplesDir }).map((path) => [
    path,
    readFileSync(join(examplesDir, path), "utf8"),
  ]),
);

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
