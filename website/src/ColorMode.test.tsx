import { render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import ColorModePage from "./routes/docs/utilities/color-mode";

describe("Color Mode page", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-color-mode");
  });

  test("names the utility and its entry point for each storage", () => {
    const { getByRole, getAllByText } = render(() => <ColorModePage />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Color Mode");
    expect(
      getAllByText("menhir/color-mode/local-storage")[0],
    ).toBeInTheDocument();
    expect(getAllByText("menhir/color-mode/cookie")[0]).toBeInTheDocument();
  });

  test("shows the toggle live, with its source", () => {
    const { getByRole } = render(() => <ColorModePage />);
    flush();
    const example = within(getByRole("region", { name: "Example" }));
    expect(
      example.getByRole("button", { name: /^Color mode: system\./ }),
    ).toBeInTheDocument();
    expect(example.getByText("ColorModeToggle.tsx")).toBeInTheDocument();
    expect(example.getByText("ColorModeIcon.tsx")).toBeInTheDocument();
  });

  test("shows the head script and the CSS in Setup", () => {
    const { getByRole } = render(() => <ColorModePage />);
    const setup = getByRole("region", { name: "Setup" });
    expect(setup).toHaveTextContent("<script innerHTML={colorModeScript()} />");
    expect(setup).toHaveTextContent("@custom-variant dark");
  });

  test("explains the cycling order for both system looks", () => {
    const { getByRole } = render(() => <ColorModePage />);
    const order = within(getByRole("region", { name: "Cycling order" }));
    expect(order.getByRole("row", { name: /^Light/ })).toHaveTextContent(
      "System → Dark → Light → System",
    );
    expect(order.getByRole("row", { name: /^Dark/ })).toHaveTextContent(
      "System → Light → Dark → System",
    );
  });

  test("lists every export, option and field in the API reference", () => {
    const { getByRole } = render(() => <ColorModePage />);
    const api = within(getByRole("region", { name: "API reference" }));
    for (const name of [
      "createColorMode",
      "colorModeScript",
      "nextColorMode",
      "resolveColorMode",
      "storageKey",
      "attribute",
      "mode",
      "system",
      "resolved",
      "setMode",
    ]) {
      expect(api.getByRole("rowheader", { name })).toBeInTheDocument();
    }
  });
});
