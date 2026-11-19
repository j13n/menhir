// solid-js, @solidjs/web and @solidjs/diagnostics each depend on
// @solidjs/signals, the reactive core. With two versions in the workspace
// they hold separate copies of it: @solidjs/diagnostics then listens on the
// wrong one and records nothing, so a diagnostics gate passes whatever the
// code does (#7, #38). Keeping solid-js, @solidjs/web and
// @solidjs/diagnostics on the same version avoids it.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const workspaceRoot = new URL("../../../../", import.meta.url);

describe("workspace", () => {
  it("resolves a single version of @solidjs/signals", () => {
    const lockfile = readFileSync(
      new URL("pnpm-lock.yaml", workspaceRoot),
      "utf8",
    );
    // Package keys in the lockfile, such as `  '@solidjs/signals@2.0.1':`.
    const versions = new Set(
      Array.from(
        lockfile.matchAll(/^ {2}'@solidjs\/signals@([^'(]+)/gm),
        (match) => match[1],
      ),
    );

    expect([...versions]).toHaveLength(1);
  });
});
