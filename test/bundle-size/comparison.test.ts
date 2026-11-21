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
    const { libraries: measured } = measureComparison();
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

  it("measures each library's components together, and menhir's same components", () => {
    const { menhirTotal, libraries: measured } = measureComparison();
    for (const library of measured) {
      const sizes = Object.values(library.components).map(
        (component) => component.size,
      );
      if (sizes.length === 0) {
        expect(library.total).toBeUndefined();
        continue;
      }
      // Together, the components are at least the largest of them and, with
      // shared code counted once, no more than their sum.
      expect(library.total!.size).toBeGreaterThanOrEqual(Math.max(...sizes));
      expect(library.total!.size).toBeLessThanOrEqual(
        sizes.reduce((sum, size) => sum + size),
      );
      // A library's components are some of the compared ones.
      expect(library.total!.menhir).toBeGreaterThan(0);
      expect(library.total!.menhir).toBeLessThanOrEqual(menhirTotal);
    }
  });
});
