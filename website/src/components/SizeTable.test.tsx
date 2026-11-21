import { render, within } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { createSignal, flush } from "solid-js";
import { describe, expect, test } from "vitest";
import type { EntryPointSize } from "virtual:menhir-sizes";

import SizeTable from "./SizeTable";

describe("<SizeTable />", () => {
  test("lists each entry point with its measured size, linked to its page", () => {
    const { getByRole } = render(() => (
      <SizeTable
        sizes={[
          { entryPoint: "menhir/switch", size: 1914 },
          { entryPoint: "menhir/alert-dialog", size: 4050 },
        ]}
      />
    ));
    const table = getByRole("table", {
      name: "Minified and gzipped, Solid left out",
    });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Entry point", "Size"]);

    const row = within(table).getByRole("row", { name: /menhir\/switch/ });
    expect(within(row).getByRole("link")).toHaveAttribute(
      "href",
      "/docs/components/switch",
    );
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["1.9 kB"]);

    expect(
      within(table).getByRole("link", { name: "menhir/alert-dialog" }),
    ).toHaveAttribute("href", "/docs/components/alert-dialog");
  });

  test("says the sizes are not measured yet when there are none", () => {
    const { getByText, queryByRole } = render(() => <SizeTable sizes={[]} />);
    expect(queryByRole("table")).not.toBeInTheDocument();
    expect(getByText("Not measured yet")).toBeInTheDocument();
  });

  test("updates when the sizes change, without tripping a Solid diagnostic", async () => {
    // captureArtifact records Solid's dev-mode diagnostics during the
    // scenario. The sizes come from a signal so that a misplaced read is
    // reactive and would be reported.
    const { artifact } = await captureArtifact(
      () => {
        const [sizes, setSizes] = createSignal<EntryPointSize[]>([]);
        const { getByRole, queryByRole } = render(() => (
          <SizeTable sizes={sizes()} />
        ));
        expect(queryByRole("table")).not.toBeInTheDocument();

        setSizes([{ entryPoint: "menhir/switch", size: 1914 }]);
        flush();
        const row = getByRole("row", { name: /menhir\/switch/ });
        expect(within(row).getAllByRole("cell")[0]).toHaveTextContent("1.9 kB");

        setSizes([{ entryPoint: "menhir/switch", size: 2210 }]);
        flush();
        expect(
          within(getByRole("row", { name: /menhir\/switch/ })).getAllByRole(
            "cell",
          )[0],
        ).toHaveTextContent("2.2 kB");
      },
      { scenario: "size-table-render" },
    );
    expectNoDiagnostics(artifact);
  });

  test("links a utility to its page under utilities", () => {
    const { getByRole } = render(() => (
      <SizeTable
        sizes={[{ entryPoint: "menhir/color-mode", size: 913, limit: 1100 }]}
      />
    ));
    expect(getByRole("link", { name: "menhir/color-mode" })).toHaveAttribute(
      "href",
      "/docs/utilities/color-mode",
    );
  });
});
