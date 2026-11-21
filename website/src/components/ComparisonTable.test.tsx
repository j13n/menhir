import { render, within } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { createSignal, flush } from "solid-js";
import { describe, expect, test } from "vitest";
import type { ComparedLibrary } from "virtual:size-comparison";

import ComparisonTable from "./ComparisonTable";

const sizes = [
  { entryPoint: "menhir/separator", size: 746 },
  { entryPoint: "menhir/switch", size: 1921 },
];

const components = [
  { slug: "separator", name: "Separator" },
  { slug: "switch", name: "Switch" },
];

const libraries: ComparedLibrary[] = [
  {
    name: "Radix",
    framework: "React",
    components: {
      separator: {
        module: "@radix-ui/react-separator",
        version: "1.2.0",
        size: 1869,
      },
      switch: {
        module: "@radix-ui/react-switch",
        version: "1.4.1",
        size: 4690,
      },
    },
  },
  {
    name: "Kobalte",
    framework: "Solid 1.x",
    components: {
      separator: {
        module: "@kobalte/core/separator",
        version: "0.13.14",
        size: 700,
      },
      switch: {
        module: "@kobalte/core/switch",
        version: "0.13.14",
        size: 3472,
      },
    },
  },
  { name: "corvu", framework: "Solid 1.x", components: {} },
];

const cells = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("<ComparisonTable />", () => {
  test("shows each component's size in menhir and in each library, by framework", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        libraries={libraries}
        components={components}
      />
    ));
    const table = getByRole("table", {
      name: "Minified and gzipped, each library's framework left out",
    });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual([
      "Component",
      "Menhir",
      "RadixReact",
      "KobalteSolid 1.x",
      "corvuSolid 1.x",
    ]);

    const row = within(table).getByRole("row", { name: /Switch/ });
    expect(within(row).getByRole("link", { name: "Switch" })).toHaveAttribute(
      "href",
      "/docs/components/switch",
    );
    expect(cells(row)).toEqual([
      "1.9 kB",
      "4.7 kB144%, 144% larger than Menhir",
      "3.5 kB81%, 81% larger than Menhir",
      "—None",
    ]);
  });

  test("shows each library's difference from menhir with a triangle, up for larger and down for smaller", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        libraries={libraries}
        components={components}
      />
    ));
    const [, radix, kobalte] = within(
      getByRole("row", { name: /Separator/ }),
    ).getAllByRole("cell");

    // 1869 bytes against menhir's 746.
    expect(radix).toHaveTextContent("1.9 kB151%, 151% larger than Menhir");
    expect(radix.querySelector("path")).toHaveAttribute("d", "M5 1 9 9H1Z");
    // 700 bytes against menhir's 746.
    expect(kobalte).toHaveTextContent("0.7 kB6%, 6% smaller than Menhir");
    expect(kobalte.querySelector("path")).toHaveAttribute("d", "M1 1H9L5 9Z");

    // The triangle and the figure are hidden from screen readers, which
    // read the words instead.
    expect(
      radix.querySelector("svg")?.closest("[aria-hidden]"),
    ).toHaveTextContent("151%");
    expect(within(radix).getByText(", 151% larger than Menhir")).toHaveClass(
      "sr-only",
    );
  });

  test("shows no triangle for a size within half a percent of menhir's", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={[{ entryPoint: "menhir/switch", size: 1921 }]}
        libraries={[
          {
            name: "Radix",
            framework: "React",
            components: {
              switch: {
                module: "@radix-ui/react-switch",
                version: "1.4.1",
                size: 1925,
              },
            },
          },
        ]}
        components={components}
      />
    ));
    const [, radix] = within(getByRole("row", { name: /Switch/ })).getAllByRole(
      "cell",
    );
    expect(radix).toHaveTextContent("1.9 kB0%, the same size as Menhir");
    expect(radix.querySelector("svg")).toBeNull();
  });

  test("marks a component a library does not have", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        libraries={libraries}
        components={components}
      />
    ));
    const row = getByRole("row", { name: /Separator/ });
    const [, , , corvu] = within(row).getAllByRole("cell");
    expect(within(corvu).getByText("—")).toHaveAttribute("aria-hidden", "true");
    expect(corvu).toHaveTextContent("None");
  });

  test("shows no total row without menhir's total", () => {
    const { queryByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        libraries={libraries}
        components={components}
      />
    ));
    expect(
      queryByRole("row", { name: /All together/ }),
    ).not.toBeInTheDocument();
  });

  test("ends with the components together, each library against menhir's same components", () => {
    const [radix, kobalte, corvu] = libraries;
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        menhirTotal={2100}
        libraries={[
          { ...radix, total: { size: 5250, menhir: 2100 } },
          // Kobalte with the switch alone: compared with menhir's switch.
          {
            ...kobalte,
            components: { switch: kobalte.components.switch },
            total: { size: 3472, menhir: 1921 },
          },
          corvu,
        ]}
        components={components}
      />
    ));
    const row = getByRole("row", { name: /All together/ });
    expect(within(row).getByRole("rowheader")).toHaveTextContent(
      "All togetherShared code counted once",
    );
    expect(cells(row)).toEqual([
      "2.1 kB",
      "5.3 kB150%, 150% larger than Menhir",
      "3.5 kB81%, 81% larger than Menhir1 of 2 components, against 1.9 kB",
      "—None",
    ]);
  });

  test("draws a stronger line above the total row, and only when there is one", () => {
    const strong = "[&>tr:last-child>*]:border-b-stone-400";
    const { getAllByRole } = render(() => (
      <>
        <ComparisonTable
          sizes={sizes}
          menhirTotal={2100}
          libraries={libraries}
          components={components}
        />
        <ComparisonTable
          sizes={sizes}
          libraries={libraries}
          components={components}
        />
      </>
    ));
    const [withTotal, without] = getAllByRole("table").map((table) =>
      table.querySelector("tbody")!,
    );
    expect(withTotal).toHaveClass(strong);
    expect(without).not.toHaveClass(strong);
  });

  test("lists the module and version measured in each library", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={sizes}
        libraries={libraries}
        components={components}
      />
    ));
    expect(
      within(getByRole("list", { name: "Modules measured" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Radix: @radix-ui/react-separator 1.2.0, @radix-ui/react-switch 1.4.1",
      "Kobalte: @kobalte/core/separator 0.13.14, @kobalte/core/switch 0.13.14",
      "corvu: none of these components yet",
    ]);
  });

  test("names a component without a display name by its slug", () => {
    const { getByRole } = render(() => (
      <ComparisonTable sizes={sizes} libraries={libraries} components={[]} />
    ));
    expect(getByRole("link", { name: "switch" })).toBeInTheDocument();
  });

  test("says the sizes are not measured yet when either report is empty", () => {
    const { getAllByText, queryByRole } = render(() => (
      <>
        <ComparisonTable sizes={[]} libraries={libraries} components={[]} />
        <ComparisonTable sizes={sizes} libraries={[]} components={[]} />
      </>
    ));
    expect(queryByRole("table")).not.toBeInTheDocument();
    expect(getAllByText("Not measured yet")).toHaveLength(2);
  });

  test("updates when the libraries change, without tripping a Solid diagnostic", async () => {
    const { artifact } = await captureArtifact(
      () => {
        const [measured, setMeasured] = createSignal<ComparedLibrary[]>([]);
        const { getByRole, queryByRole } = render(() => (
          <ComparisonTable
            sizes={sizes}
            libraries={measured()}
            components={components}
          />
        ));
        expect(queryByRole("table")).not.toBeInTheDocument();

        setMeasured(libraries);
        flush();
        expect(cells(getByRole("row", { name: /Switch/ }))).toEqual([
          "1.9 kB",
          "4.7 kB144%, 144% larger than Menhir",
          "3.5 kB81%, 81% larger than Menhir",
          "—None",
        ]);
      },
      { scenario: "comparison-table-render" },
    );
    expectNoDiagnostics(artifact);
  });

  test("leaves utilities out: no other library is measured for them", () => {
    const { getByRole } = render(() => (
      <ComparisonTable
        sizes={[
          ...sizes,
          { entryPoint: "menhir/color-scheme/local-storage", size: 1010 },
        ]}
        libraries={libraries}
        components={components}
      />
    ));
    expect(
      within(getByRole("table")).queryByRole("row", { name: /color-scheme/ }),
    ).not.toBeInTheDocument();
  });
});
