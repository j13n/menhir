import { render, within } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import LlmsTxt from "./routes/docs/llms-txt";

const origin = window.location.origin;

describe("llms.txt page", () => {
  test("links the index and a component's Markdown, outside the router", () => {
    const { getByRole } = render(() => <LlmsTxt />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("llms.txt");
    const files = within(getByRole("region", { name: "What is there" }));
    for (const [name, href] of [
      ["/llms.txt", "/llms.txt"],
      ["/docs/components/switch.md", "/docs/components/switch.md"],
    ]) {
      const link = files.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_self");
    }
  });

  test("gives a prompt and project instructions with this site's address", () => {
    const { getByRole } = render(() => <LlmsTxt />);
    expect(
      getByRole("region", { name: "Point an agent at it" }).querySelector(
        "pre code",
      ),
    ).toHaveTextContent(`Read ${origin}/llms.txt`);
    expect(
      getByRole("region", {
        name: "Add it to your project's instructions",
      }).querySelector("pre code"),
    ).toHaveTextContent(`${origin}/docs/components/<name>.md`);
  });

  test("shows how to keep a copy of a component's Markdown", () => {
    const { getByRole } = render(() => <LlmsTxt />);
    expect(
      getByRole("region", { name: "Keep a copy" }).querySelector("pre code"),
    ).toHaveTextContent(
      `curl -o menhir-switch.md ${origin}/docs/components/switch.md`,
    );
  });
});
