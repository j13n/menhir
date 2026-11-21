import { describe, expect, it } from "vitest";

import {
  nextColorMode,
  parseColorMode,
  resolveColorMode,
} from "./colorMode.ts";
import type { ColorMode, ResolvedColorMode } from "./colorMode.ts";

describe("resolveColorMode", () => {
  it("keeps a fixed mode whatever the system prefers", () => {
    expect(resolveColorMode("light", "dark")).toBe("light");
    expect(resolveColorMode("dark", "light")).toBe("dark");
  });

  it("replaces system with the system's look", () => {
    expect(resolveColorMode("system", "light")).toBe("light");
    expect(resolveColorMode("system", "dark")).toBe("dark");
  });
});

describe("nextColorMode", () => {
  it.each<[ResolvedColorMode, ColorMode[]]>([
    ["light", ["system", "dark", "light", "system"]],
    ["dark", ["system", "light", "dark", "system"]],
  ])("cycles through every mode when the system is %s", (system, expected) => {
    const visited = [expected[0]!];
    for (let i = 1; i < expected.length; i++) {
      visited.push(nextColorMode(visited[i - 1]!, system));
    }
    expect(visited).toEqual(expected);
  });

  it.each<ResolvedColorMode>(["light", "dark"])(
    "changes the look on the first click from system (system %s)",
    (system) => {
      const next = nextColorMode("system", system);
      expect(resolveColorMode(next, system)).not.toBe(system);
    },
  );
});

describe("parseColorMode", () => {
  it("reads light and dark", () => {
    expect(parseColorMode("light")).toBe("light");
    expect(parseColorMode("dark")).toBe("dark");
  });

  it.each([null, undefined, "", "system", "Dark", "sepia"])(
    "reads %j as system",
    (value) => {
      expect(parseColorMode(value)).toBe("system");
    },
  );
});
