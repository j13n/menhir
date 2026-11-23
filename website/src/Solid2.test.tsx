import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import Solid2 from "./routes/docs/solid-2";

describe("Solid 2.0 page", () => {
  test("is titled for what people search for", () => {
    const { getByRole } = render(() => <Solid2 />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "Accessible UI components for Solid 2.0",
    );
  });

  test("covers each way the components follow Solid 2.0", () => {
    const { getAllByRole } = render(() => <Solid2 />);
    expect(
      getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "What it needs",
      "Props are read where they are used",
      "Another element: the render prop",
      "Controlled and uncontrolled state",
      "Async data under Loading",
      "Server rendering and hydration",
      "Popups without a Portal",
      "Small bundles",
      "Next",
    ]);
  });

  test("shows the render prop and async items in code", () => {
    const { getByRole } = render(() => <Solid2 />);
    expect(
      getByRole("region", { name: "Another element: the render prop" }),
    ).toHaveTextContent(
      'render={(props) => <a {...props} href="/settings" />}',
    );
    const async = getByRole("region", { name: "Async data under Loading" });
    expect(async.querySelector("pre code")).toHaveTextContent(
      "const results = createDeferred(() => searchCountries(query()));",
    );
    expect(async.querySelector("pre code")).toHaveTextContent(
      "`${count} results`",
    );
  });

  test("links on to the rest of the docs", () => {
    const { getByRole } = render(() => <Solid2 />);
    expect(getByRole("link", { name: "Bundle size" })).toHaveAttribute(
      "href",
      "/docs/bundle-size",
    );
    expect(getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/docs/getting-started",
    );
    expect(getByRole("link", { name: "all components" })).toHaveAttribute(
      "href",
      "/docs/components",
    );
  });
});
