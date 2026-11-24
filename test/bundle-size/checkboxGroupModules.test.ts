import { describe, expect, it } from "vitest";

import { bundleApp } from "./findFloatingModules.ts";

// A module of Checkbox Group, compiled (`dist/checkbox-group`) or source
// (`dist/source/checkbox-group`).
const groupModule = /\/dist\/(source\/)?checkbox-group\//;

/** The modules of Checkbox Group that an app importing `specifier` alone bundles. */
async function findGroupModules(specifier: string): Promise<string[]> {
  const output = await bundleApp(specifier);
  return output.flatMap((file) =>
    file.type === "chunk"
      ? file.moduleIds.filter((id) => groupModule.test(id))
      : [],
  );
}

// Checkbox Group builds on Checkbox (`simpleBases` in
// packages/menhir/layers.ts), and Checkbox reads no context of the group's,
// so an app with Checkbox alone pays nothing for the group
// (src/checkbox-group/README.md, "Decisions"; #146).
describe("Checkbox Group", () => {
  it("is not in an app that imports menhir/checkbox alone", async () => {
    expect(await findGroupModules("menhir/checkbox")).toEqual([]);
  });

  it("is found in an app that imports menhir/checkbox-group, so the check can fail", async () => {
    expect(await findGroupModules("menhir/checkbox-group")).not.toEqual([]);
  });
});
