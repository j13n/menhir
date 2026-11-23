import { describe, expect, it } from "vitest";

import { bundleApp } from "./findFloatingModules.ts";

// A module of the util that maps a schema's issues to Form's errors,
// compiled or source.
const utilModule = /\/dist\/(source\/)?form\/standard-schema\//;

/** The util's modules that an app importing `specifier` alone bundles. */
async function findUtilModules(specifier: string): Promise<string[]> {
  const output = await bundleApp(specifier);
  return output.flatMap((file) =>
    file.type === "chunk"
      ? file.moduleIds.filter((id) => utilModule.test(id))
      : [],
  );
}

// The util is an import of its own, so a Form without a schema does not
// bundle it (PLAN.md section 6, rule 6; src/form/README.md; #144).
describe("issuesToErrors", () => {
  it("is not in an app that imports menhir/form alone", async () => {
    expect(await findUtilModules("menhir/form")).toEqual([]);
  });

  it("is found in an app that imports menhir/form/standard-schema, so the check can fail", async () => {
    expect(await findUtilModules("menhir/form/standard-schema")).not.toEqual(
      [],
    );
  });
});
