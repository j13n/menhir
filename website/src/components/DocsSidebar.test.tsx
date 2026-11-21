import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import DocsSidebar from "./DocsSidebar";

const links = (list: HTMLElement) =>
  within(list)
    .getAllByRole("link")
    .map((link) => [link.textContent, link.getAttribute("href")]);

describe("<DocsSidebar />", () => {
  test("links to every docs page, in reading order", () => {
    const { getByRole } = render(() => <DocsSidebar />);
    const nav = getByRole("navigation", { name: "Docs" });
    expect(links(nav)).toEqual([
      ["Getting started", "/docs/getting-started"],
      ["Bundle size", "/docs/bundle-size"],
      ["llms.txt", "/docs/llms-txt"],
      ["Checkbox", "/docs/components/checkbox"],
      ["Switch", "/docs/components/switch"],
    ]);
  });

  test("groups the component pages under their own heading", () => {
    const { getByRole } = render(() => <DocsSidebar />);
    const nav = within(getByRole("navigation", { name: "Docs" }));
    const heading = nav.getByRole("heading", { name: "Components" });
    expect(within(heading).queryByRole("link")).toBeNull();
    expect(links(nav.getByRole("list", { name: "Components" }))).toEqual([
      ["Checkbox", "/docs/components/checkbox"],
      ["Switch", "/docs/components/switch"],
    ]);
  });
});
