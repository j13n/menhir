import { describe, expect, it } from "vitest";

import { bundleApp } from "./findFloatingModules.ts";

// A module of Toast's swipe or measure, compiled (`dist/toast`) or source
// (`dist/source/toast`).
const optionalModule = /\/dist\/(source\/)?toast\/(swipe|measure)\//;

/** An app that uses these members of `Toast`, and makes a list. */
const app = (parts: string[]) =>
  `import { createToastManager, Toast } from "menhir/toast";\n` +
  `console.log(createToastManager, ${parts.map((part) => `Toast.${part}`).join(", ")});\n`;

const parts = [
  "Provider",
  "Region",
  "Root",
  "Title",
  "Description",
  "Action",
  "Close",
];

/** The modules of swipe and measure that an app using `used` bundles. */
async function findOptionalModules(used: string[]): Promise<string[]> {
  const output = await bundleApp("menhir/toast", app(used));
  return output.flatMap((file) =>
    file.type === "chunk"
      ? file.moduleIds
          .filter((id) => optionalModule.test(id))
          .map((id) => optionalModule.exec(id)![2]!)
      : [],
  );
}

// Swipe to dismiss and the measured heights are refs an app passes, not
// flags (PLAN.md section 6, rule 6; src/toast/README.md, "Decisions"), so
// an app that passes neither ships neither (#207).
describe("Toast", () => {
  it("bundles neither swipe nor measure in an app that uses every part", async () => {
    expect(await findOptionalModules(parts)).toEqual([]);
  });

  it("bundles swipe alone in an app that also uses it", async () => {
    expect(await findOptionalModules([...parts, "swipe"])).toEqual(["swipe"]);
  });

  it("bundles measure alone in an app that also uses it", async () => {
    expect(await findOptionalModules([...parts, "measure"])).toEqual([
      "measure",
    ]);
  });
});
