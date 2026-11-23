import { describe, expect, test } from "vitest";

import { componentDocs } from "./componentDocs";
import {
  componentBreadcrumbs,
  componentDescription,
  DESCRIPTION_LIMIT,
  homeStructuredData,
} from "./pageHead";

describe("componentDescription", () => {
  test("is the first sentence after an introduction, when it fits", () => {
    expect(
      componentDescription({
        name: "Switch",
        description:
          "A control that turns a setting on or off. It renders a native button.",
      }),
    ).toBe(
      "An unstyled, accessible Switch for SolidJS: a control that turns a setting on or off.",
    );
  });

  test("leaves out the WAI-ARIA pattern when the whole sentence is too long", () => {
    const description = componentDescription({
      name: "Tooltip",
      description:
        "A short text that describes an element, such as what an icon button does or its shortcut, shown on hover or focus: the WAI-ARIA tooltip pattern. More.",
    });
    expect(description).toBe(
      "An unstyled, accessible Tooltip for SolidJS: a short text that describes an element, such as what an icon button does or its shortcut, shown on hover or focus.",
    );
  });

  test("keeps a colon that does not introduce the WAI-ARIA pattern", () => {
    expect(() =>
      componentDescription({
        name: "Navigation Menu",
        description: `A site's navigation: ${"links and buttons, ".repeat(6)}more.`,
      }),
    ).toThrow(/Give its ComponentDoc a summary/);
  });

  test("uses the summary in place of the description", () => {
    expect(
      componentDescription({
        name: "Menu",
        description: "Long.",
        summary: "A list of actions.",
      }),
    ).toBe("An unstyled, accessible Menu for SolidJS: a list of actions.");
  });

  test("fails for a description too long even without its pattern", () => {
    expect(() =>
      componentDescription({
        name: "Menu",
        description: `${"a ".repeat(90)}.`,
      }),
    ).toThrow(/Give its ComponentDoc a summary/);
  });

  test.each(componentDocs.map((doc) => [doc.name, doc] as const))(
    "%s's fits in search results",
    (_, doc) => {
      expect(componentDescription(doc).length).toBeLessThanOrEqual(
        DESCRIPTION_LIMIT,
      );
    },
  );
});

test("componentBreadcrumbs lists the site, Components and the page", () => {
  expect(componentBreadcrumbs("Select", "select")).toEqual({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Menhir",
        item: "https://menhir-ui.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Components",
        item: "https://menhir-ui.com/docs/components",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Select",
        item: "https://menhir-ui.com/docs/components/select",
      },
    ],
  });
});

test("the home page describes the site and the library's source code", () => {
  const data = homeStructuredData();
  expect(data["@context"]).toBe("https://schema.org");
  expect(data["@graph"]).toEqual([
    { "@type": "WebSite", name: "Menhir", url: "https://menhir-ui.com/" },
    expect.objectContaining({
      "@type": "SoftwareSourceCode",
      name: "Menhir",
      url: "https://menhir-ui.com/",
      codeRepository: "https://github.com/j13n/menhir",
      programmingLanguage: "TypeScript",
      license: "https://opensource.org/licenses/MIT",
    }),
  ]);
});
