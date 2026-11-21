import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import GettingStarted from "./routes/docs/getting-started";

describe("getting started page", () => {
  test("says where the project stands", () => {
    const { getByRole } = render(() => <GettingStarted />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(
      "Getting started",
    );
    const status = getByRole("region", { name: "Status" });
    expect(status).toHaveTextContent(
      "the API may change between minor versions",
    );
  });

  test("shows how to install Menhir and its peer dependencies", () => {
    const { getByRole } = render(() => <GettingStarted />);
    const install = getByRole("region", { name: "Install" });
    const commands = [...install.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(commands).toEqual([
      "pnpm add menhir",
      "pnpm add solid-js @solidjs/web",
    ]);
  });

  test("shows a first component imported from its own entry point", () => {
    const { getByRole } = render(() => <GettingStarted />);
    const usage = getByRole("region", { name: "Your first component" });
    expect(usage.querySelector("pre code")).toHaveTextContent(
      'import { Switch } from "menhir/switch";',
    );
  });

  test("links on to the components", () => {
    const { getByRole } = render(() => <GettingStarted />);
    expect(getByRole("link", { name: "all components" })).toHaveAttribute(
      "href",
      "/docs/components",
    );
    expect(getByRole("link", { name: "bundle size" })).toHaveAttribute(
      "href",
      "/docs/bundle-size",
    );
  });
});
