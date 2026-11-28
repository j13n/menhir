import { fireEvent, render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";

import NavBar from "./NavBar";

/** The text of each tooltip, open or not: jsdom has no popover to open. */
function tooltipTexts(container: ReturnType<typeof within>) {
  return container
    .getAllByRole("tooltip", { hidden: true })
    .map((tooltip: HTMLElement) => tooltip.textContent);
}

describe("<NavBar />", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-color-scheme");
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

  test("links to the GitHub repository in a new tab", () => {
    const { getByRole } = render(() => <NavBar />);
    const github = within(getByRole("banner")).getByRole("link", {
      name: "GitHub",
    });
    expect(github).toHaveAttribute("href", "https://github.com/j13n/menhir");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("names the GitHub link in a tooltip rather than a title, and reads the name once", () => {
    const { getByRole } = render(() => <NavBar />);
    const header = within(getByRole("banner"));
    const github = header.getByRole("link", { name: "GitHub" });
    expect(github).not.toHaveAttribute("title");
    expect(github).toHaveAccessibleDescription("");
    expect(tooltipTexts(header)).toContain("GitHub");
  });

  test("has the color scheme toggle, which cycles the scheme and saves it", () => {
    const { getByRole } = render(() => <NavBar />);
    flush();
    // The test setup's matchMedia reports a light system.
    const toggle = within(getByRole("banner")).getByRole("button", {
      name: "Color scheme: system. Switch to dark.",
    });
    expect(document.documentElement).toHaveAttribute(
      "data-color-scheme",
      "light",
    );

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName("Color scheme: dark. Switch to light.");
    expect(document.documentElement).toHaveAttribute(
      "data-color-scheme",
      "dark",
    );
    expect(localStorage.getItem("color-scheme")).toBe("dark");

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName(
      "Color scheme: light. Switch to system.",
    );

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAccessibleName(
      "Color scheme: system. Switch to dark.",
    );
    expect(localStorage.getItem("color-scheme")).toBeNull();
  });

  test("shows the toggle's name in a tooltip rather than a title, which follows the scheme", () => {
    const { getByRole } = render(() => <NavBar />);
    flush();
    const header = within(getByRole("banner"));
    const toggle = header.getByRole("button", {
      name: "Color scheme: system. Switch to dark.",
    });
    expect(toggle).not.toHaveAttribute("title");
    expect(toggle).toHaveAccessibleDescription("");
    expect(tooltipTexts(header)).toContain(
      "Color scheme: system. Switch to dark.",
    );

    fireEvent.click(toggle);
    flush();
    expect(tooltipTexts(header)).toContain(
      "Color scheme: dark. Switch to light.",
    );
  });
});
