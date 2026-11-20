import { render, within } from "@solidjs/testing-library";
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
    expect(status).toHaveTextContent("Switch is the first component");
    expect(status.textContent).not.toMatch(/npm|published/);
  });

  test("shows how to install Menhir and its peer dependencies", () => {
    const { getByRole } = render(() => <GettingStarted />);
    const install = within(getByRole("region", { name: "Install" }));
    expect(install.getByText("pnpm add menhir").tagName).toBe("CODE");
    expect(install.getByText("pnpm add solid-js @solidjs/web").tagName).toBe(
      "CODE",
    );
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
