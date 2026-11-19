import { cleanup, render, within } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import Home from "./routes/index";

describe("home page", () => {
  // The animation runs a timer; unmount so it does not outlive each test.
  afterEach(cleanup);

  test("says what Menhir is", () => {
    const { getByRole } = render(() => <Home />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Menhir");
    expect(getByRole("main")).toHaveTextContent(
      "Unstyled, accessible UI primitives for SolidJS 2.0",
    );
  });

  test("shows the menhir animation under the introduction", () => {
    const { getByRole } = render(() => <Home />);
    const scene = getByRole("img", { name: /ASCII drawing of a menhir/ });
    const intro = getByRole("main").querySelector("p");
    expect(intro?.compareDocumentPosition(scene)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      getByRole("button", { name: /(Pause|Play) animation/ }),
    ).toBeInTheDocument();
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

  test("credits the projects that inspired Menhir", () => {
    const { getByRole } = render(() => <Home />);
    const credits = within(
      getByRole("region", { name: "Inspiration and credits" }),
    );
    const projects = {
      "Base UI": "https://base-ui.com",
      Kobalte: "https://kobalte.dev",
      corvu: "https://corvu.dev",
      Radix: "https://www.radix-ui.com",
      "Ark UI": "https://ark-ui.com",
      "Floating UI": "https://floating-ui.com",
    };
    for (const [name, href] of Object.entries(projects)) {
      expect(credits.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  test("says Base UI's licence notice is kept", () => {
    const { getByRole } = render(() => <Home />);
    expect(
      getByRole("region", { name: "Inspiration and credits" }),
    ).toHaveTextContent("copyright notice is kept in Menhir's licence");
  });
});
