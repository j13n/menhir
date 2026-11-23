// @vitest-environment node
import { describe, expect, test } from "vitest";

import { pageSources } from "./sitemap-lastmod.ts";

/** A file tree with just these files and folders. */
function only(...files: string[]) {
  return (file: string) => files.includes(file);
}

describe("pageSources", () => {
  test("the home page is the index route", () => {
    expect(pageSources("/", only("src/routes/index.tsx"))).toEqual([
      "src/routes/index.tsx",
    ]);
  });

  test("a section's page can be its folder's index route", () => {
    expect(
      pageSources(
        "/docs/components",
        only("src/routes/docs/components/index.tsx"),
      ),
    ).toEqual(["src/routes/docs/components/index.tsx"]);
  });

  test("a component page adds its ComponentDoc and examples", () => {
    expect(
      pageSources(
        "/docs/components/dialog",
        only(
          "src/routes/docs/components/dialog.tsx",
          "src/componentDocs/dialog.ts",
          "src/examples/dialog",
        ),
      ),
    ).toEqual([
      "src/routes/docs/components/dialog.tsx",
      "src/componentDocs/dialog.ts",
      "src/examples/dialog",
    ]);
  });

  test("a utility page adds its examples", () => {
    expect(
      pageSources(
        "/docs/utilities/theme",
        only("src/routes/docs/utilities/theme.tsx", "src/examples/theme"),
      ),
    ).toEqual(["src/routes/docs/utilities/theme.tsx", "src/examples/theme"]);
  });

  test("finds the files on disk by default", () => {
    expect(pageSources("/docs/components/dialog")).toEqual([
      "src/routes/docs/components/dialog.tsx",
      "src/componentDocs/dialog.ts",
      "src/examples/dialog",
    ]);
  });
});
