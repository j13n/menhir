// The lint rules that hold the bundle-size rules of PLAN.md section 6: the
// layer table, no `Object.assign` compound components and no root barrel.
// Runs the workspace's oxlint config over lint-fixtures, a copy of the layout
// of src in which some files break a rule on purpose, so a rule that stops
// working fails here instead of passing silently on src.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const workspaceRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const fixtures = "packages/menhir/test/workspace/lint-fixtures/src/";

type Report = { diagnostics: { code: string; filename: string }[] };

function lintFixtures() {
  let output: string;
  try {
    output = execFileSync(
      "node_modules/.bin/oxlint",
      ["--format=json", fixtures],
      {
        cwd: workspaceRoot,
        encoding: "utf8",
        // The config skips the fixtures unless this is set.
        env: { ...process.env, MENHIR_LINT_FIXTURES: "1" },
      },
    );
  } catch (error) {
    // oxlint exits with 1 when it reports an error, which the fixtures do.
    // With no report on stdout it failed to run, such as on a broken config.
    output = (error as { stdout: string }).stdout;
    if (!output) throw error;
  }

  const report = JSON.parse(output) as Report;
  const byFile: Record<string, string[]> = {};
  for (const { code, filename } of report.diagnostics) {
    (byFile[filename.slice(fixtures.length)] ??= []).push(code);
  }
  for (const codes of Object.values(byFile)) codes.sort();
  return byFile;
}

describe("lint", () => {
  it("fails exactly the fixtures that break a bundle-size rule", () => {
    // Files left out pass: each layer importing what the table allows, a
    // component importing its own modules, and a test importing anything.
    expect(lintFixtures()).toEqual({
      // core imports nothing internal and no dependency but Solid.
      "core/importsSwitch.ts": ["boundaries(dependencies)"],
      "core/importsFloatingUi.ts": ["boundaries(dependencies)"],
      // floating imports core, not components.
      "floating/importsSwitch.ts": ["boundaries(dependencies)"],
      // A simple component imports core only.
      "switch/importsFloating.ts": ["boundaries(dependencies)"],
      "switch/importsFloatingUi.ts": ["boundaries(dependencies)"],
      "switch/importsToggle.ts": ["boundaries(dependencies)"],
      "switch/importsRootModule.ts": ["boundaries(dependencies)"],
      // A popup component imports core and floating, not @floating-ui/dom.
      "dialog/importsFloatingUi.ts": ["boundaries(dependencies)"],
      "dialog/importsSwitch.ts": ["boundaries(dependencies)"],
      "dialog/importsPopover.ts": ["boundaries(dependencies)"],
      // A popup imports the popup it builds on, and no other: Alert Dialog
      // imports Dialog, not Popover, and Dialog does not import it back.
      "alert-dialog/importsPopover.ts": ["boundaries(dependencies)"],
      "dialog/importsAlertDialog.ts": ["boundaries(dependencies)"],
      // Compound components are namespace re-exports, not Object.assign.
      "switch/compound.ts": ["eslint(no-restricted-properties)"],
      // No root barrel: every module sits in a layer's folder.
      "index.ts": ["boundaries(no-unknown-files)"],
    });
  });
});
