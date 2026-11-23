import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import FormsGuide from "./routes/docs/forms";

describe("Forms without a library page", () => {
  test("is titled for what people search for", () => {
    const { getByRole } = render(() => <FormsGuide />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "Forms without a library",
    );
  });

  test("builds a form on a store and an uncontrolled one, with their code", () => {
    const { getByRole, getAllByRole } = render(() => <FormsGuide />);
    expect(
      getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "A form on a store",
      "An uncontrolled form, with the router",
      "Next",
    ]);
    const store = getByRole("region", { name: "A form on a store" });
    expect(store).toHaveTextContent(
      "setErrors(issuesToErrors(result.issues));",
    );
    expect(store).toHaveTextContent('"~standard": {');
    expect(
      getByRole("region", { name: "An uncontrolled form, with the router" }),
    ).toHaveTextContent(
      '<Form method="post" action={subscribe} errors={errors()}>',
    );
  });

  test("links to Form and Field", () => {
    const { getAllByRole } = render(() => <FormsGuide />);
    const hrefs = getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/docs/components/form");
    expect(hrefs).toContain("/docs/components/field");
  });
});
