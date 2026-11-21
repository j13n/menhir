// @vitest-environment node
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, type Rolldown } from "vite";
import { describe, expect, test } from "vitest";

import { highlight as highlightCode } from "./src/highlight.ts";
import highlight, { themeCss } from "./vite-plugin-highlight.ts";

const highlightModule = fileURLToPath(
  new URL("src/highlight.ts", import.meta.url),
);

/** Builds `main.ts`, with the other files beside it, and returns its chunk and exports. */
async function buildEntry(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "menhir-highlight-"));
  for (const [name, source] of Object.entries(files)) {
    writeFileSync(join(root, name), source);
  }
  const output = (await build({
    configFile: false,
    root,
    logLevel: "silent",
    plugins: [highlight()],
    build: {
      write: false,
      minify: false,
      rolldownOptions: {
        input: "main.ts",
        preserveEntrySignatures: "strict",
      },
    },
  })) as Rolldown.RolldownOutput;
  const chunk = output.output.find(
    (file): file is Rolldown.OutputChunk =>
      file.type === "chunk" && file.isEntry,
  )!;
  const exports = await import(
    `data:text/javascript,${encodeURIComponent(chunk.code)}`
  );
  return { chunk, exports };
}

describe("highlight plugin", () => {
  test("replaces a tag with the code's tokens, leaving the highlighter out", async () => {
    const { chunk, exports } = await buildEntry({
      "main.ts": `import { tsx as code } from ${JSON.stringify(highlightModule)};
export const snippet = code\`const a = 1;\`;`,
    });
    expect(exports.snippet).toEqual(highlightCode("const a = 1;", "tsx"));
    expect(
      chunk.moduleIds.filter((id) => id.includes("@tanstack/highlight")),
    ).toEqual([]);
  });

  test("serves a file imported with ?highlight as its tokens", async () => {
    const { exports } = await buildEntry({
      "main.ts": `import example from "./example.css?highlight";
export { example };`,
      "example.css": ".switch { color: red; }\n",
    });
    expect(exports.example).toEqual(
      highlightCode(".switch { color: red; }\n", "css"),
    );
  });

  test("fails the build for a tag with ${} inside", async () => {
    await expect(
      buildEntry({
        "main.ts": `import { tsx } from ${JSON.stringify(highlightModule)};
const name = "a";
export const snippet = tsx\`const \${name} = 1;\`;`,
      }),
    ).rejects.toThrow("cannot be highlighted when the site is built");
  });

  test("fails the build when a page would highlight as it runs", async () => {
    await expect(
      buildEntry({
        "main.ts": `import { highlight } from ${JSON.stringify(highlightModule)};
export const snippet = highlight(String(Math.random()), "ts");`,
      }),
    ).rejects.toThrow("bundles the highlighter");
  });

  test("colours tokens light and dark, under the site's own pre styles", () => {
    const css = themeCss();
    expect(css).toMatch(/^@layer base \{/);
    expect(css).toContain(':root[data-color-scheme="dark"] {');
    expect(css).toContain(":where(pre.th-code) {");
    expect(css).toContain(".th-keyword { color: var(--th-keyword); }");
  });
});
