import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { componentCategories } from "../componentDocs/categories";
import { componentDocs } from "../componentDocs/index";
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
      ["Styling", "/docs/styling"],
      ["Solid 2.0", "/docs/solid-2"],
      ["Forms without a library", "/docs/forms"],
      ["Bundle size", "/docs/bundle-size"],
      ["llms.txt", "/docs/llms-txt"],
    ]);
  });

  test("links to the components overview, then every component page by category, in alphabetical order within each", () => {
    const { getByRole } = render(() => <DocsSidebar />);
    const nav = within(getByRole("navigation", { name: "Docs" }));
    const heading = nav.getByRole("heading", { level: 2, name: "Components" });
    expect(within(heading).queryByRole("link")).toBeNull();
    expect(links(nav.getByRole("list", { name: "Components" }))).toEqual([
      ["Overview", "/docs/components"],
    ]);

    const categories = nav
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent!);
    expect(categories).toEqual(
      componentCategories.filter((category) =>
        componentDocs.some((doc) => doc.category === category),
      ),
    );

    const linked: string[] = [];
    for (const category of categories) {
      const group = links(nav.getByRole("list", { name: category }));
      const names = group.map(([name]) => name!);
      expect(names).toEqual(names.toSorted());
      for (const [name, href] of group) {
        const doc = componentDocs.find((doc) => doc.name === name)!;
        expect(doc.category).toBe(category);
        expect(href).toBe(`/docs/components/${doc.slug}`);
        linked.push(href!);
      }
    }
    expect(linked.sort()).toEqual(componentPages.sort());
    expect(links(nav.getByRole("list", { name: "Inputs" }))).toContainEqual([
      "Switch",
      "/docs/components/switch",
    ]);
  });

  test("links to every utility page under its own heading", () => {
    const utilityPages = Object.keys(
      import.meta.glob("../routes/docs/utilities/*.tsx"),
    ).map((path) => `/docs/utilities/${path.match(/([^/]+)\.tsx$/)![1]}`);

    const { getByRole } = render(() => <DocsSidebar />);
    const nav = within(getByRole("navigation", { name: "Docs" }));
    const utilities = links(nav.getByRole("list", { name: "Utilities" }));
    expect(utilities.map(([, href]) => href).sort()).toEqual(
      utilityPages.sort(),
    );
    expect(utilities).toContainEqual([
      "Color Scheme",
      "/docs/utilities/color-scheme",
    ]);
  });
});
