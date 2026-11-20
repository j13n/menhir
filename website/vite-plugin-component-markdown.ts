import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

import { componentDocs } from "./src/componentDocs/index.ts";
import type { CodeFile, ComponentDoc } from "./src/componentDocs/types.ts";
import {
  componentMarkdown,
  llmsTxt,
  markdownPath,
} from "./src/componentMarkdown.ts";
import { defaultReport, readSizes } from "./vite-plugin-sizes.ts";

const defaultExamples = fileURLToPath(new URL("src/examples", import.meta.url));

/** The file of a component's Markdown in the build: its path without the leading slash. */
const markdownFile = (slug: string) => markdownPath(slug).slice(1);

/**
 * Serves each component page as Markdown at `/docs/components/<slug>.md`, and
 * an index of them at `/llms.txt`, for agents to read: from the dev server,
 * and as files in the build. It is made
 * from the same data as the page (`src/componentDocs/`), the example's files
 * in `src/examples/<slug>/tailwind/` and `css/`, and the size-limit report.
 *
 * `vite build` fails when the report is missing or lacks a component's entry
 * point, as vite-plugin-sizes.ts does; the dev server warns and leaves the
 * size out.
 */
export default function componentMarkdownPlugin(
  options: { docs?: ComponentDoc[]; examples?: string; report?: string } = {},
): Plugin {
  const docs = options.docs ?? componentDocs;
  const examples = options.examples ?? defaultExamples;
  const report = options.report ?? defaultReport;

  /** Each component's Markdown; `fail` is called for a size it cannot give. */
  function render(doc: ComponentDoc, fail: (message: string) => void) {
    let size: number | undefined;
    if (existsSync(report)) {
      const entryPoint = `menhir/${doc.slug}`;
      size = readSizes(report).find(
        (row) => row.entryPoint === entryPoint,
      )?.size;
      if (size === undefined) {
        fail(
          `${entryPoint} is not in ${report}. Give it a size budget in test/bundle-size/.size-limit.js, then run \`pnpm --filter @menhir/bundle-size size:json\`.`,
        );
      }
    } else {
      fail(
        `No size-limit report at ${report}. Run \`pnpm --filter @menhir/bundle-size size:json\`; \`pnpm build\` in website runs it first.`,
      );
    }
    return componentMarkdown(doc, {
      size,
      example: {
        tailwind: readExample(join(examples, doc.slug, "tailwind")),
        css: readExample(join(examples, doc.slug, "css")),
      },
    });
  }

  return {
    name: "menhir-component-markdown",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split("?")[0].slice(1);
        if (path === "llms.txt") {
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(llmsTxt(docs));
          return;
        }
        const doc = docs.find((doc) => markdownFile(doc.slug) === path);
        if (!doc) return next();
        const markdown = render(doc, (message) =>
          server.config.logger.warn(`${message} The Markdown has no size.`),
        );
        response.setHeader("Content-Type", "text/markdown; charset=utf-8");
        response.end(markdown);
      });
    },
    generateBundle() {
      // The static site is the client build; the server build has no files.
      if (this.environment.name !== "client") return;
      this.emitFile({
        type: "asset",
        fileName: "llms.txt",
        source: llmsTxt(docs),
      });
      for (const doc of docs) {
        this.emitFile({
          type: "asset",
          fileName: markdownFile(doc.slug),
          source: render(doc, (message) => {
            throw new Error(message);
          }),
        });
      }
    },
  };
}

/** An example's files, TSX first, then the rest by name. */
function readExample(dir: string): CodeFile[] {
  const isTsx = (name: string) => name.endsWith(".tsx");
  return readdirSync(dir)
    .toSorted(
      (a, b) => Number(isTsx(b)) - Number(isTsx(a)) || a.localeCompare(b),
    )
    .map((name) => ({ name, code: readFileSync(join(dir, name), "utf8") }));
}
