import { render, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import Components from "./routes/docs/components/index";

// The size report is not built for the tests; this stands in for it.
vi.mock("virtual:menhir-sizes", () => ({
  sizes: [{ entryPoint: "menhir/switch", size: 1914, limit: 2300 }],
}));

describe("components page", () => {
  test("lists every component with its size, linked to its page", () => {
    const { getByRole } = render(() => <Components />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Components");
    const row = getByRole("row", { name: /menhir\/switch/ });
    expect(within(row).getByRole("link")).toHaveAttribute(
      "href",
      "/docs/components/switch",
    );
    expect(row).toHaveTextContent("1.9 kB");
  });
});
