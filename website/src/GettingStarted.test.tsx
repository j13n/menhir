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

  test("says how to keep Menhir out of the Cloudflare plugin's pre-bundling", () => {
    const { getByRole } = render(() => <GettingStarted />);
    const cloudflare = getByRole("region", {
      name: "Server rendering on Cloudflare",
    });
    expect(cloudflare).toHaveTextContent("React is not defined");
    expect(cloudflare.querySelector("pre code")).toHaveTextContent(
      'ssr: { optimizeDeps: { exclude: ["menhir"] } }',
    );
  });

  test("says how to give an agent both skills", () => {
    const { getByRole } = render(() => <GettingStarted />);
    const install = getByRole("region", { name: "Give your agent the skills" });
    const [instructions, copy] = [...install.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(instructions).toBe(
      "To wire up Menhir components, follow node_modules/menhir/skills/menhir/SKILL.md.\nTo style Menhir components, follow node_modules/menhir/skills/menhir-styling/SKILL.md.",
    );
    expect(copy).toBe(
      "cp -r node_modules/menhir/skills/menhir node_modules/menhir/skills/menhir-styling .claude/skills/",
    );
    expect(
      within(install).getByRole("link", { name: "Styling" }),
    ).toHaveAttribute("href", "/docs/styling");
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
