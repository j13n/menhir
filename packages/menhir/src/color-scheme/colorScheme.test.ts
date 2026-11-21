import { describe, expect, it } from "vitest";

import {
  nextColorScheme,
  parseColorScheme,
  resolveColorScheme,
} from "./colorScheme.ts";
import type { ColorScheme, ResolvedColorScheme } from "./colorScheme.ts";

describe("resolveColorScheme", () => {
  it("keeps a fixed scheme whatever the system prefers", () => {
    expect(resolveColorScheme("light", "dark")).toBe("light");
    expect(resolveColorScheme("dark", "light")).toBe("dark");
  });

  it("replaces system with the system's look", () => {
    expect(resolveColorScheme("system", "light")).toBe("light");
    expect(resolveColorScheme("system", "dark")).toBe("dark");
  });
});

describe("nextColorScheme", () => {
  it.each<[ResolvedColorScheme, ColorScheme[]]>([
    ["light", ["system", "dark", "light", "system"]],
    ["dark", ["system", "light", "dark", "system"]],
  ])(
    "cycles through every scheme when the system is %s",
    (system, expected) => {
      const visited = [expected[0]!];
      for (let i = 1; i < expected.length; i++) {
        visited.push(nextColorScheme(visited[i - 1]!, system));
      }
      expect(visited).toEqual(expected);
    },
  );

  it.each<ResolvedColorScheme>(["light", "dark"])(
    "changes the look on the first click from system (system %s)",
    (system) => {
      const next = nextColorScheme("system", system);
      expect(resolveColorScheme(next, system)).not.toBe(system);
    },
  );
});

describe("parseColorScheme", () => {
  it("reads light and dark", () => {
    expect(parseColorScheme("light")).toBe("light");
    expect(parseColorScheme("dark")).toBe("dark");
  });

  it.each([null, undefined, "", "system", "Dark", "sepia"])(
    "reads %j as system",
    (value) => {
      expect(parseColorScheme(value)).toBe("system");
    },
  );
});
