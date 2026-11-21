import { beforeAll, describe, expect, it } from "vitest";

import { simpleEntryPoints } from "./entryPoints.ts";
import { findFloatingModules } from "./findFloatingModules.ts";

describe("the floating layer", () => {
  it("is checked for at least one simple component", () => {
    expect(simpleEntryPoints).toContain("menhir/switch");
  });

  it.each(simpleEntryPoints)(
    "is not in an app that imports %s alone",
    async (entryPoint) => {
      expect(await findFloatingModules(entryPoint)).toEqual([]);
    },
  );
});

describe("findFloatingModules", () => {
  // A package whose switch entry imports a floating module, which imports
  // @floating-ui/dom.
  let leaky: string[];

  beforeAll(async () => {
    leaky = await findFloatingModules("./fixtures/leaky/dist/switch/index.js");
  });

  it("reports a floating module that the entry pulls in", () => {
    expect(leaky).toContainEqual(
      expect.stringMatching(/\/fixtures\/leaky\/dist\/floating\/position\.js$/),
    );
  });

  it("reports an import of @floating-ui/dom", () => {
    expect(leaky).toContain("@floating-ui/dom");
  });

  it("fails when an import does not resolve, rather than finding nothing", async () => {
    await expect(findFloatingModules("no-such-package")).rejects.toThrow(
      /no-such-package/,
    );
  });
});
