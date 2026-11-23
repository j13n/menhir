// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { includesText } from "./includesText.ts";

describe("includesText", () => {
  it("matches a query at the start, in the middle and at the end", () => {
    expect(includesText("New Zealand", "New")).toBe(true);
    expect(includesText("New Zealand", "zeal")).toBe(true);
    expect(includesText("New Zealand", "land")).toBe(true);
    expect(includesText("New Zealand", "Norway")).toBe(false);
    expect(includesText("Peru", "Peruvian")).toBe(false);
  });

  it("ignores case and accents", () => {
    expect(includesText("Côte d’Ivoire", "cote")).toBe(true);
    expect(includesText("São Tomé", "SAO TOME")).toBe(true);
    expect(includesText("Zürich", "zur")).toBe(true);
    expect(includesText("Malmö", "mo")).toBe(true);
  });

  it("matches everything with an empty query", () => {
    expect(includesText("Apple", "")).toBe(true);
    expect(includesText("", "")).toBe(true);
  });
});
