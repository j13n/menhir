import { render, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

import { componentCategories } from "./componentDocs/categories";
// Kept outside src/routes so the file-system router never sees it as a page.
import Components from "./routes/docs/components/index";

// The size report is not built for the tests; this stands in for it.
vi.mock("virtual:menhir-sizes", () => ({
  sizes: [
    { entryPoint: "menhir/dialog", size: 3300 },
    { entryPoint: "menhir/switch", size: 1914 },
    { entryPoint: "menhir/color-scheme", size: 900 },
  ],
}));

describe("components page", () => {
  test("lists the components by category, each with its size, linked to its page", () => {
    const { getAllByRole, getByRole, queryByRole } = render(() => (
      <Components />
    ));
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "UI components for SolidJS",
    );
    expect(
      getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([...componentCategories]);

    const inputs = within(getByRole("table", { name: "Inputs" }));
    const row = inputs.getByRole("row", { name: /menhir\/switch/ });
    expect(within(row).getByRole("link")).toHaveAttribute(
      "href",
      "/docs/components/switch",
    );
    expect(row).toHaveTextContent("1.9 kB");
    expect(
      within(getByRole("table", { name: "Overlays" })).getByRole("row", {
        name: /menhir\/dialog/,
      }),
    ).toHaveTextContent("3.3 kB");
    // A utility has a page of its own, not a place among the components.
    expect(
      queryByRole("row", { name: /menhir\/color-scheme/ }),
    ).not.toBeInTheDocument();
  });
});
