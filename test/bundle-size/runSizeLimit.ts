import { spawnSync } from "node:child_process";

export type SizeLimitResult = {
  name: string;
  size: number;
  sizeLimit: number;
  passed: boolean;
};

/**
 * Runs `size-limit --json` here, with `.size-limit.js` or the `config` given,
 * and returns its report.
 */
export function runSizeLimit(config?: string): SizeLimitResult[] {
  const root = import.meta.dirname;
  const run = spawnSync(
    `${root}/node_modules/.bin/size-limit`,
    ["--json", ...(config ? ["--config", config] : [])],
    { cwd: root, encoding: "utf8" },
  );
  // Over budget, size-limit exits with 1 and still prints the report. On an
  // error, such as a missing config, it prints `{ "error": stack }` instead.
  const report = JSON.parse(run.stdout);
  if (!Array.isArray(report)) throw new Error(report.error);
  return report;
}
