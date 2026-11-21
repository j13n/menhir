import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import DocsSidebar from "./DocsSidebar";

const links = (list: HTMLElement) =>
  within(list)
    .getAllByRole("link")
    .map((link) => [link.textContent, link.getAttribute("href")]);

// Every component page, from the route files themselves, so that a page
// without a sidebar link fails here.
const componentPages = Object.keys(
  import.meta.glob("../routes/docs/components/*.tsx"),
)
  .map((path) => path.match(/([^/]+)\.tsx$/)![1])
  .filter((slug) => slug !== "index")
  .map((slug) => `/docs/components/${slug}`);

describe("<DocsSidebar />", () => {
  test("links to the guides first, in reading order", () => {
    const { getByRole } = render(() => <DocsSidebar />);
    const nav = within(getByRole("navigation", { name: "Docs" }));
    expect(links(nav.getAllByRole("list")[0])).toEqual([
      ["Getting started", "/docs/getting-started"],
      ["Bundle size", "/docs/bundle-size"],
      ["llms.txt", "/docs/llms-txt"],
    ]);
  });

  test("links to the components overview, then every component page in alphabetical order, under its own heading", () => {
    const { getByRole } = render(() => <DocsSidebar />);
    const nav = within(getByRole("navigation", { name: "Docs" }));
    const heading = nav.getByRole("heading", { name: "Components" });
    expect(within(heading).queryByRole("link")).toBeNull();

    const [overview, ...components] = links(
      nav.getByRole("list", { name: "Components" }),
    );
    expect(overview).toEqual(["Overview", "/docs/components"]);
    expect(components.map(([, href]) => href).sort()).toEqual(
      componentPages.sort(),
    );
    const names = components.map(([name]) => name!);
    expect(names).toEqual(names.toSorted());
    expect(components).toContainEqual(["Switch", "/docs/components/switch"]);
  });
});
