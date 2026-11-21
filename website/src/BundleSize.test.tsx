import { render, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import BundleSize from "./routes/docs/bundle-size";

// The size report is not built for the tests; this stands in for it.
vi.mock("virtual:menhir-sizes", () => ({
  sizes: [{ entryPoint: "menhir/switch", size: 1914, limit: 2300 }],
}));

describe("bundle size page", () => {
  test("shows every entry point's size and budget", () => {
    const { getByRole } = render(() => <BundleSize />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Bundle size");
    const sizes = within(getByRole("region", { name: "Sizes" }));
    const row = sizes.getByRole("row", { name: /menhir\/switch/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1.9 kB", "2.3 kB"]);
  });

  test("says how the sizes are measured", () => {
    const { getByRole } = render(() => <BundleSize />);
    expect(
      getByRole("region", { name: "How it is measured" }),
    ).toHaveTextContent("minified and gzipped");
  });
});
