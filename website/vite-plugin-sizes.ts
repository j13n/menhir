import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const moduleId = "virtual:menhir-sizes";
/** `virtual:menhir-sizes/switch` is the size of `menhir/switch`. */
const entryPrefix = `${moduleId}/`;

/** The JSON report `pnpm size:json` writes in test/bundle-size (#9). */
export const defaultReport = fileURLToPath(
  new URL("../test/bundle-size/dist/sizes.json", import.meta.url),
);

/**
 * Serves the sizes of the size-limit report, so the site never states a size
 * by hand:
 *
 * - `virtual:menhir-sizes` exports `sizes`, each entry point's size and budget.
 * - `virtual:menhir-sizes/<name>` default-exports the size of `menhir/<name>`,
 *   for its component page.
 *
 * `vite build` fails when the report is missing, or a page asks for an entry
 * point it does not have. The dev server and Vitest warn instead and serve no
 * size, so pages say "Not measured yet".
 */
export default function menhirSizes(options: { file?: string } = {}): Plugin {
  const file = options.file ?? defaultReport;
  let command: "build" | "serve" = "serve";

  return {
    name: "menhir-sizes",
    configResolved(config) {
      command = config.command;
    },
    resolveId(id) {
      if (id === moduleId || id.startsWith(entryPrefix)) return `\0${id}`;
    },
    load(id) {
      const isList = id === `\0${moduleId}`;
      if (!isList && !id.startsWith(`\0${entryPrefix}`)) return;
      const fail = (message: string) => {
        if (command === "build") throw new Error(message);
        this.warn(`${message} Pages show no size until then.`);
      };

      let sizes: EntryPointSize[] | undefined;
      if (existsSync(file)) {
        // A changed report reloads the dev server. Only an existing file: Vitest
        // fails to resolve a watched file that is missing, so a report made
        // after the dev server started needs a restart.
        this.addWatchFile(file);
        sizes = readSizes(file);
      } else {
        fail(
          `No size-limit report at ${file}. Run \`pnpm --filter @menhir/bundle-size size:json\`; \`pnpm build\` in website runs it first.`,
        );
      }

      if (isList) return `export const sizes = ${JSON.stringify(sizes ?? [])};`;

      const entryPoint = `menhir/${id.slice(`\0${entryPrefix}`.length)}`;
      const row = sizes?.find((size) => size.entryPoint === entryPoint);
      if (sizes && !row) {
        fail(
          `${entryPoint} is not in ${file}. Give it a size budget in test/bundle-size/.size-limit.js, then run \`pnpm --filter @menhir/bundle-size size:json\`.`,
        );
      }
      return `export default ${row?.size};`;
    },
  };
}

type EntryPointSize = import("virtual:menhir-sizes").EntryPointSize;

type SizeLimitResult = { name: string; size: number; sizeLimit: number };

export function readSizes(file: string): EntryPointSize[] {
  const report: unknown = JSON.parse(readFileSync(file, "utf8"));
  // On an error, such as a missing config, size-limit writes
  // `{ "error": stack }` instead of the list of results.
  if (!Array.isArray(report) || !report.every(isResult)) {
    const error = (report as { error?: unknown } | null)?.error;
    throw new Error(
      `${file} is not a size-limit --json report${typeof error === "string" ? `: ${error}` : "."}`,
    );
  }
  return report.map((result) => ({
    entryPoint: result.name,
    size: result.size,
    limit: result.sizeLimit,
  }));
}

function isResult(value: unknown): value is SizeLimitResult {
  const result = value as Partial<SizeLimitResult> | null;
  return (
    typeof result?.name === "string" &&
    typeof result.size === "number" &&
    typeof result.sizeLimit === "number"
  );
}
