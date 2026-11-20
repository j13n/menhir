import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import DocsLayout from "./routes/docs";

describe("docs layout", () => {
  test("shows the docs navigation beside the page", () => {
    const { getByRole } = render(() => (
      <DocsLayout>
        <main>
          <h1>A docs page</h1>
        </main>
      </DocsLayout>
    ));
    expect(getByRole("navigation", { name: "Docs" })).toBeInTheDocument();
    expect(getByRole("main")).toHaveTextContent("A docs page");
  });
});
