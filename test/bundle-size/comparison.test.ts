// Checks the comparison of comparison.ts by measuring it, as the docs site's
// build does.
import { describe, expect, it } from "vitest";

import { libraries } from "./comparison.ts";
import { entryPoints } from "./entryPoints.ts";
import { measureComparison } from "./measureComparison.ts";

describe("comparison with other libraries", () => {
  it("compares only components menhir has", () => {
    for (const library of libraries) {
      for (const component of Object.keys(library.components)) {
        expect(entryPoints).toContain(`menhir/${component}`);
      }
    }
  });

  it("measures each library's version of a component, with the package version", () => {
    const measured = measureComparison();
    expect(measured.map((library) => library.name)).toEqual(
      libraries.map((library) => library.name),
    );
    for (const [i, library] of measured.entries()) {
      expect(Object.keys(library.components)).toEqual(
        Object.keys(libraries[i].components),
      );
      for (const component of Object.values(library.components)) {
        expect(component).toEqual({
          module: expect.any(String),
          version: expect.stringMatching(/^\d+\.\d+\.\d+/),
          size: expect.any(Number),
        });
        expect(component.size).toBeGreaterThan(0);
      }
    }
  });
});
