// @vitest-environment node
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  build,
  createLogger,
  createServer,
  type InlineConfig,
  type Rolldown,
} from "vite";
import { describe, expect, test } from "vitest";

import type { ComponentDoc } from "./src/componentDocs/types.ts";

import { tsx } from "./src/highlight.ts";
import componentMarkdown from "./vite-plugin-component-markdown.ts";

const switchDoc: ComponentDoc = {
  slug: "switch",
  name: "Switch",
  description: "A control that turns a setting on or off.",
  anatomy: tsx`<Switch.Root />`,
  api: [],
  keyboard: [],
};

/**
 * A project in a new temporary folder: an entry module for the build, the
 * Switch example with Tailwind and with CSS, and a size-limit report unless
 * `report` is false.
 */
function project({ report = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "menhir-markdown-"));
  writeFileSync(join(root, "main.js"), "export {};\n");
  const examples = join(root, "examples");
  mkdirSync(join(examples, "switch", "tailwind"), { recursive: true });
  mkdirSync(join(examples, "switch", "css"), { recursive: true });
  writeFileSync(
    join(examples, "switch", "tailwind", "SwitchExample.tsx"),
    '<Switch.Root class="h-6" />\n',
  );
  writeFileSync(join(examples, "switch", "css", "switch.css"), ".switch {}\n");
  writeFileSync(
    join(examples, "switch", "css", "SwitchExample.tsx"),
    '<Switch.Root class="switch" />\n',
  );
  const file = join(root, "sizes.json");
  if (report) {
    writeFileSync(
      file,
      JSON.stringify([{ name: "menhir/switch", size: 1914, sizeLimit: 2300 }]),
    );
  }
  const config: InlineConfig = {
    configFile: false,
    root,
    logLevel: "silent",
    plugins: [componentMarkdown({ docs: [switchDoc], examples, report: file })],
  };
  return { config, file };
}

async function buildAssets(config: InlineConfig) {
  const output = (await build({
    ...config,
    build: { write: false, rolldownOptions: { input: "main.js" } },
  })) as Rolldown.RolldownOutput;
  return new Map(
    output.output
      .filter((file) => file.type === "asset")
      .map((file) => [file.fileName, String(file.source)]),
  );
}

async function serve(config: InlineConfig, path: string) {
  const warnings: string[] = [];
  const logger = createLogger("silent");
  logger.warn = (message) => {
    warnings.push(message);
  };
  const server = await createServer({
    ...config,
    customLogger: logger,
    server: { port: 0, ws: false, watch: null },
  });
  await server.listen();
  try {
    const response = await fetch(new URL(path, server.resolvedUrls!.local[0]));
    return { response, text: await response.text(), warnings };
  } finally {
    await server.close();
  }
}

describe("component Markdown", () => {
  test("writes each component's Markdown into the build, next to its page", async () => {
    const assets = await buildAssets(project().config);
    const markdown = assets.get("docs/components/switch.md");
    expect(markdown).toMatch(/^# Switch\n/);
    expect(markdown).toContain("- Size: 1.9 kB");
  });

  test("includes the example's files, TSX first, from its tailwind and css folders", async () => {
    const assets = await buildAssets(project().config);
    const markdown = assets.get("docs/components/switch.md")!;
    const tailwind = markdown.indexOf('<Switch.Root class="h-6" />');
    const cssTsx = markdown.indexOf('<Switch.Root class="switch" />');
    const css = markdown.indexOf(".switch {}");
    expect(tailwind).toBeGreaterThan(-1);
    expect(cssTsx).toBeGreaterThan(tailwind);
    expect(css).toBeGreaterThan(cssTsx);
  });

  test("writes llms.txt into the build, linking each component's Markdown", async () => {
    const assets = await buildAssets(project().config);
    expect(assets.get("llms.txt")).toContain(
      "- [Switch](/docs/components/switch.md): A control that turns a setting on or off.",
    );
  });

  test("fails the build when the report is missing", async () => {
    const { config, file } = project({ report: false });
    await expect(buildAssets(config)).rejects.toThrow(
      `No size-limit report at ${file}`,
    );
  });

  test("serves each component's Markdown from the dev server", async () => {
    const { response, text } = await serve(
      project().config,
      "/docs/components/switch.md",
    );
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(text).toMatch(/^# Switch\n/);
  });

  test("serves llms.txt from the dev server", async () => {
    const { response, text } = await serve(project().config, "/llms.txt");
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(text).toMatch(/^# Menhir\n/);
  });

  test("serves Markdown without a size in dev when the report is missing, with a warning", async () => {
    const { text, warnings } = await serve(
      project({ report: false }).config,
      "/docs/components/switch.md",
    );
    expect(text).toContain("- Size: not measured yet");
    expect(warnings).toEqual([
      expect.stringContaining("No size-limit report at"),
    ]);
  });
});
