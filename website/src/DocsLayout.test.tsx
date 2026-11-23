import { fireEvent, render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import DocsLayout from "./routes/docs";

const renderLayout = () =>
  render(() => (
    <DocsLayout>
      <main>
        <h1>A docs page</h1>
      </main>
    </DocsLayout>
  ));

describe("docs layout", () => {
  test("shows the docs navigation beside the page", () => {
    const { getByRole } = renderLayout();
    expect(getByRole("navigation", { name: "Docs" })).toBeInTheDocument();
    expect(getByRole("main")).toHaveTextContent("A docs page");
  });

  test("on narrow screens, a button opens and closes the navigation, which starts closed", () => {
    const { getByRole } = renderLayout();
    const button = getByRole("button", { name: "Docs menu" });
    const panel = document.getElementById(
      button.getAttribute("aria-controls")!,
    )!;
    expect(panel).toContainElement(getByRole("navigation", { name: "Docs" }));
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveClass("hidden", "md:block");

    fireEvent.click(button);
    flush();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveClass("hidden");

    fireEvent.click(button);
    flush();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveClass("hidden");
  });

  test("picking a page in the open navigation closes it", () => {
    const { getByRole } = renderLayout();
    const button = getByRole("button", { name: "Docs menu" });
    fireEvent.click(button);
    flush();

    const link = within(getByRole("navigation", { name: "Docs" })).getByRole(
      "link",
      { name: "Styling" },
    );
    // jsdom does not navigate; keep it from trying.
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    flush();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
