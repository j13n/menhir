import { fireEvent, render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";

import NavBar from "./NavBar";

describe("<NavBar />", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

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

  test("has the color mode toggle, which cycles the mode and saves it", () => {
    const { getByRole } = render(() => <NavBar />);
    flush();
    // The test setup's matchMedia reports a light system.
    const toggle = within(getByRole("banner")).getByRole("button", {
      name: "Color mode: system. Switch to dark.",
    });
    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName("Color mode: dark. Switch to light.");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("color-mode")).toBe("dark");

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName("Color mode: light. Switch to system.");

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName("Color mode: system. Switch to dark.");
    expect(localStorage.getItem("color-mode")).toBeNull();
  });
});
