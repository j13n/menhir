import { describe, expect, it } from "vitest";

import { bundleApp } from "./findFloatingModules.ts";

// A module of Field, compiled (`dist/field`) or source (`dist/source/field`).
const fieldModule = /\/dist\/(source\/)?field\//;

/** The modules of Field that an app importing `specifier` alone bundles. */
async function findFieldModules(specifier: string): Promise<string[]> {
  const output = await bundleApp(specifier);
  return output.flatMap((file) =>
    file.type === "chunk"
      ? file.moduleIds.filter((id) => fieldModule.test(id))
      : [],
  );
}

// A control joins a Field through Field.Control's `render`, and reads no
// context of Field's, so a control outside a Field pays nothing for it
// (src/field/README.md, "Decisions"; #141). Form hands its errors to the
// Fields through a context in `core`, so it imports none of Field either
// (src/form/README.md; #144).
describe("Field", () => {
  it.each([
    "menhir/switch",
    "menhir/checkbox",
    "menhir/checkbox-group",
    "menhir/input",
    "menhir/radio",
    "menhir/form",
  ])("is not in an app that imports %s alone", async (entryPoint) => {
    expect(await findFieldModules(entryPoint)).toEqual([]);
  });

  it("is found in an app that imports menhir/field, so the check can fail", async () => {
    expect(await findFieldModules("menhir/field")).not.toEqual([]);
  });
});
