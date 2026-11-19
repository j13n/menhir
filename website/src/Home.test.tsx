import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import Home from "./routes/index";

describe("home page", () => {
  test("says what Menhir is", () => {
    const { getByRole } = render(() => <Home />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Menhir");
    expect(getByRole("main")).toHaveTextContent(
      "Unstyled, accessible UI primitives for SolidJS 2.0",
    );
  });

  test("states that nothing is published yet", () => {
    const { getByRole } = render(() => <Home />);
    const status = getByRole("region", { name: "Status" });
    expect(status).toHaveTextContent("not published to npm yet");
  });

  test("shows the install command", () => {
    const { getByRole } = render(() => <Home />);
    const install = getByRole("region", { name: "Install" });
    expect(install.querySelector("pre code")).toHaveTextContent(
      "pnpm add menhir",
    );
  });

  test("credits Base UI", () => {
    const { getByRole } = render(() => <Home />);
    expect(getByRole("link", { name: "Base UI" })).toHaveAttribute(
      "href",
      "https://base-ui.com",
    );
  });
});
