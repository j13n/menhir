import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

import { createThemeCss } from "@tanstack/highlight/theme";
import MagicString from "magic-string";
import { parseSync, type Plugin } from "vite";

import { menhirDark, menhirLight } from "./highlight-theme.ts";
import { highlight, type Language } from "./src/highlight.ts";

const highlightModule = fileURLToPath(
  new URL("src/highlight.ts", import.meta.url),
);
const themeModule = "virtual:highlight-theme.css";
const highlightQuery = "?highlight";
/** Ends the id `<file>?highlight` resolves to. */
const highlightSuffix = ".highlight.js";

/** The tags `src/highlight.ts` exports, by their exported names. */
const tags: Record<string, Language> = {
  css: "css",
  shell: "shell",
  ts: "ts",
  tsx: "tsx",
};

/** The language of a file imported with `?highlight`, by its extension. */
const extensions: Record<string, Language> = {
  ".css": "css",
  ".sh": "shell",
  ".ts": "ts",
  ".tsx": "tsx",
};

/**
 * The colours, as CSS variables and a rule per token class, light and dark.
 * In the base layer, with the code block's own rule in `:where()`, so the
 * site's `pre` styles win.
 */
export function themeCss() {
  const css = createThemeCss({
    light: menhirLight,
    dark: menhirDark,
    darkSelector: ':root[data-color-mode="dark"]',
    codeBlockSelector: ":where(pre.th-code)",
  });
  return `@layer base {\n${css}\n}\n`;
}

type Node = { type: string; start: number; end: number; [key: string]: any };

/** Calls `visit` on every node of an ESTree tree. */
function walk(node: unknown, visit: (node: Node) => void) {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
  } else if (node && typeof node === "object") {
    if (typeof (node as Node).type === "string") visit(node as Node);
    for (const value of Object.values(node)) walk(value, visit);
  }
}

/**
 * Highlights code when the site is built, with `src/highlight.ts`:
 *
 * - replaces each tag imported from it, as in tsx`<Switch.Root />`, with
 *   the `Highlighted` it would return;
 * - serves `<file>?highlight`, such as `./Example.tsx?highlight`, as that
 *   file's `Highlighted`;
 * - serves `virtual:highlight-theme.css`, the colours.
 *
 * A tag's template must have no `${}`, or the build fails. So does a client
 * build that still bundles the highlighter.
 */
export default function highlightPlugin(): Plugin {
  return {
    name: "highlight",
    enforce: "pre",
    async resolveId(source, importer) {
      if (source === themeModule) return `\0${source}`;
      if (!source.endsWith(highlightQuery)) return;
      const file = await this.resolve(
        source.slice(0, -highlightQuery.length),
        importer,
        { skipSelf: true },
      );
      // Its own id, as Vite's CSS plugin would take `a.css?highlight` for CSS.
      if (file) return `\0${file.id}${highlightSuffix}`;
    },
    load(id) {
      if (id === `\0${themeModule}`) return themeCss();
      if (!id.startsWith("\0") || !id.endsWith(highlightSuffix)) return;
      const file = id.slice(1, -highlightSuffix.length);
      const lang = extensions[extname(file)];
      if (!lang) {
        this.error(
          `${file}?highlight: no language for ${extname(file) || "a file without an extension"}. Add one to vite-plugin-highlight.ts.`,
        );
      }
      this.addWatchFile(file);
      const highlighted = highlight(readFileSync(file, "utf8"), lang);
      return `export default ${JSON.stringify(highlighted)};`;
    },
    async transform(code, id) {
      if (id.startsWith("\0")) return;
      const file = id.split("?")[0];
      if (
        file === highlightModule ||
        file.includes("/node_modules/") ||
        !/\.[jt]sx?$/.test(file) ||
        !/\/highlight(\.ts)?["']/.test(code)
      ) {
        return;
      }

      const { program } = parseSync(file, code);
      // The local name of each tag, as `import { tsx as code }` allows.
      const locals = new Map<string, Language>();
      for (const statement of program.body) {
        if (statement.type !== "ImportDeclaration") continue;
        const resolved = await this.resolve(statement.source.value, id);
        if (resolved?.id.split("?")[0] !== highlightModule) continue;
        for (const specifier of statement.specifiers) {
          if (specifier.type !== "ImportSpecifier") continue;
          const imported =
            specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.imported.value;
          const lang = tags[imported];
          if (lang) locals.set(specifier.local.name, lang);
        }
      }
      if (locals.size === 0) return;

      const output = new MagicString(code);
      walk(program, (node) => {
        if (node.type !== "TaggedTemplateExpression") return;
        if (node.tag.type !== "Identifier") return;
        const lang = locals.get(node.tag.name);
        if (!lang) return;
        const [quasi] = node.quasi.quasis;
        if (node.quasi.expressions.length > 0 || quasi.value.cooked == null) {
          this.error(
            `${node.tag.name}\`…\` cannot be highlighted when the site is built: its template has \${} or a bad escape.`,
            node.start,
          );
        }
        // Parenthesised, so an object literal is never read as a block.
        const highlighted = highlight(quasi.value.cooked, lang);
        output.overwrite(
          node.start,
          node.end,
          `(${JSON.stringify(highlighted)})`,
        );
      });
      if (!output.hasChanged()) return;
      return {
        code: output.toString(),
        map: output.generateMap({ hires: true, source: id }),
      };
    },
    generateBundle(_, bundle) {
      if (this.environment.name !== "client") return;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        if (chunk.moduleIds.some((id) => id.includes("@tanstack/highlight"))) {
          this.error(
            `${chunk.fileName} bundles the highlighter, so a page highlights code as it runs. Highlight with a tag from src/highlight.ts, with no \${} inside, or a ?highlight import.`,
          );
        }
      }
    },
  };
}
