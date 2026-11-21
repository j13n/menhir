import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import NavBar from "./NavBar";

describe("<NavBar />", () => {
  test("links home, to the docs' getting started page and to the components", () => {
    const { getByRole } = render(() => <NavBar />);
    const header = getByRole("banner");
    expect(
      within(header).getByRole("link", { name: "Menhir" }),
    ).toHaveAttribute("href", "/");
    const nav = within(header).getByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs/getting-started",
    );
    expect(
      within(nav).getByRole("link", { name: "Components" }),
    ).toHaveAttribute("href", "/docs/components");
  });
});
