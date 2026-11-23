import { render, within } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import BundleSize from "./routes/docs/bundle-size";

// The size reports are not built for the tests; these stand in for them.
vi.mock("virtual:menhir-sizes", () => ({
  sizes: [{ entryPoint: "menhir/switch", size: 1914 }],
}));
vi.mock("virtual:size-comparison", () => ({
  menhirTotal: 1914,
  libraries: [
    {
      name: "Radix",
      framework: "React",
      components: {
        switch: {
          module: "@radix-ui/react-switch",
          version: "1.4.1",
          size: 4690,
        },
      },
      total: { size: 4690, menhir: 1914 },
    },
  ],
}));

describe("bundle size page", () => {
  test("shows every entry point's size, and says they are gzipped", () => {
    const { getByRole, getByText } = render(() => <BundleSize />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Bundle size");
    expect(
      getByText("Every size on this page is minified and gzipped", {
        exact: false,
      }),
    ).toBeInTheDocument();
    const sizes = within(getByRole("region", { name: "Sizes" }));
    const row = sizes.getByRole("row", { name: /menhir\/switch/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1.9 kB"]);
  });

  test("compares each component's size with other libraries'", () => {
    const { getByRole } = render(() => <BundleSize />);
    const comparison = within(getByRole("region", { name: "Other libraries" }));
    const row = comparison.getByRole("row", { name: /Switch/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1.9 kB", "4.7 kB145%, 145% larger than Menhir"]);
    expect(
      comparison.getByRole("list", { name: "Modules measured" }),
    ).toHaveTextContent("Radix: @radix-ui/react-switch 1.4.1");
  });

  test("says the comparison is of sizes only, not of what a component includes", () => {
    const { getByRole } = render(() => <BundleSize />);
    expect(getByRole("region", { name: "Other libraries" })).toHaveTextContent(
      "These are sizes only. The libraries differ in API and in what each component includes",
    );
  });

  test("says Base UI's menubar module has no menu parts", () => {
    const { getByRole } = render(() => <BundleSize />);
    expect(
      within(getByRole("region", { name: "Other libraries" })).getByRole(
        "list",
        { name: "Notes" },
      ),
    ).toHaveTextContent(
      "1 Base UI's @base-ui/react/menubar is the bar alone. Its menus are built from the parts of @base-ui/react/menu",
    );
  });

  test("compares the components imported together", () => {
    const { getByRole } = render(() => <BundleSize />);
    const comparison = within(getByRole("region", { name: "Other libraries" }));
    expect(
      within(comparison.getByRole("row", { name: /All together/ }))
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1.9 kB", "4.7 kB145%, 145% larger than Menhir"]);
    expect(
      getByRole("region", { name: "How it is measured" }),
    ).toHaveTextContent("there shared code is counted once");
  });

  test("says how the sizes are measured", () => {
    const { getByRole } = render(() => <BundleSize />);
    expect(
      getByRole("region", { name: "How it is measured" }),
    ).toHaveTextContent("minified and gzipped");
    expect(
      getByRole("region", { name: "How it is measured" }),
    ).toHaveTextContent("react and react-dom for the React libraries");
    expect(
      getByRole("region", { name: "How it is measured" }),
    ).toHaveTextContent("The app is a production build");
  });
});
