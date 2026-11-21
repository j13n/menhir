import { render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import ColorSchemePage from "./routes/docs/utilities/color-scheme";

describe("Color Scheme page", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-color-scheme");
  });

  test("names the utility and its entry point for each storage", () => {
    const { getByRole, getAllByText } = render(() => <ColorSchemePage />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "Color Scheme",
    );
    expect(
      getAllByText("menhir/color-scheme/local-storage")[0],
    ).toBeInTheDocument();
    expect(getAllByText("menhir/color-scheme/cookie")[0]).toBeInTheDocument();
  });

  test("shows the toggle live, with its source", () => {
    const { getByRole } = render(() => <ColorSchemePage />);
    flush();
    const example = within(getByRole("region", { name: "Example" }));
    expect(
      example.getByRole("button", { name: /^Color scheme: system\./ }),
    ).toBeInTheDocument();
    expect(example.getByText("ColorSchemeToggle.tsx")).toBeInTheDocument();
    expect(example.getByText("ColorSchemeIcon.tsx")).toBeInTheDocument();
  });

  test("shows the head script and the CSS in Setup", () => {
    const { getByRole } = render(() => <ColorSchemePage />);
    const setup = getByRole("region", { name: "Setup" });
    expect(setup).toHaveTextContent(
      "<script innerHTML={colorSchemeScript()} />",
    );
    expect(setup).toHaveTextContent("@custom-variant dark");
  });

  test("shows how to allow the head script under a Content Security Policy", () => {
    const { getByRole } = render(() => <ColorSchemePage />);
    const csp = getByRole("region", { name: "Content Security Policy" });
    expect(csp).toHaveTextContent(
      "<script nonce={nonce} innerHTML={colorSchemeScript()} />",
    );
    expect(csp).toHaveTextContent(
      'createHash("sha256").update(colorSchemeScript()).digest("base64")',
    );
  });

  test("explains the cycling order for both system looks", () => {
    const { getByRole } = render(() => <ColorSchemePage />);
    const order = within(getByRole("region", { name: "Cycling order" }));
    expect(order.getByRole("row", { name: /^Light/ })).toHaveTextContent(
      "System → Dark → Light → System",
    );
    expect(order.getByRole("row", { name: /^Dark/ })).toHaveTextContent(
      "System → Light → Dark → System",
    );
  });

  test("lists every export, option and field in the API reference", () => {
    const { getByRole } = render(() => <ColorSchemePage />);
    const api = within(getByRole("region", { name: "API reference" }));
    for (const name of [
      "createColorScheme",
      "colorSchemeScript",
      "nextColorScheme",
      "resolveColorScheme",
      "storageKey",
      "attribute",
      "scheme",
      "system",
      "resolved",
      "setScheme",
    ]) {
      expect(api.getByRole("rowheader", { name })).toBeInTheDocument();
    }
  });
});
