import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import type { ComponentExampleProps } from "./components/ComponentExample";
import { looks } from "./looks";
// Kept outside src/routes so the file-system router never sees it as a page.
import Styling from "./routes/docs/styling";

/**
 * The pages of the components that have a worked example in every look,
 * read from the examples themselves, so that the page cannot miss one.
 */
const workedExamplePages = Object.entries(
  import.meta.glob<Record<string, ComponentExampleProps>>(
    "./examples/*/index.ts",
    { eager: true },
  ),
)
  .filter(([, module]) => {
    const example = Object.values(module)[0]!;
    return looks.every((look) => example.looks?.[look.name]);
  })
  .map(([path]) => `/docs/components/${path.split("/")[2]}`)
  .sort();

describe("styling page", () => {
  test("shows how to style a part through its data attributes", () => {
    const { getByRole } = render(() => <Styling />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Styling");
    const byHand = getByRole("region", {
      name: "Styling a component yourself",
    });
    expect(byHand.querySelector("pre code")).toHaveTextContent(
      ".switch[data-checked]",
    );
  });

  test("names the shipped looks and links to their worked examples and the badge recipe", () => {
    const { getByRole } = render(() => <Styling />);
    const looks = getByRole("region", { name: "Looks" });
    expect(looks).toHaveTextContent("shadcn look");
    expect(looks).toHaveTextContent("Bootstrap look");
    const links = [...looks.querySelectorAll("a")].map((link) =>
      link.getAttribute("href"),
    );
    expect(links.at(-1)).toBe("/docs/badge");
    expect(workedExamplePages).not.toEqual([]);
    expect(links.slice(0, -1).sort()).toEqual(workedExamplePages);
  });

  test("says how to give an agent the skill", () => {
    const { getByRole } = render(() => <Styling />);
    const install = getByRole("region", { name: "Give your agent the skill" });
    const [instructions, copy] = [...install.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(instructions).toBe(
      "To style Menhir components in an app with no styles yet, or in a look such as the shadcn look or the Bootstrap look, follow node_modules/menhir/skills/menhir-styling/SKILL.md.",
    );
    expect(copy).toBe(
      "cp -r node_modules/menhir/skills/menhir-styling .claude/skills/",
    );
  });

  test("says what to ask for, and what the agent does", () => {
    const { getByRole } = render(() => <Styling />);
    const use = getByRole("region", { name: "Ask for a look" });
    expect(use.querySelector("pre code")).toHaveTextContent(
      "in the shadcn look",
    );
    expect(use.querySelector("pre code")).toHaveTextContent(
      "the Bootstrap look",
    );
    expect(use.querySelectorAll("ol > li")).toHaveLength(4);
  });

  test("covers a look of the app's own, and an app in the other technology", () => {
    const { getByRole } = render(() => <Styling />);
    expect(
      getByRole("region", { name: "A look of your own" }),
    ).toHaveTextContent("writes that look's tokens first");
    expect(
      getByRole("region", { name: "A look in the other technology" }),
    ).toHaveTextContent("token for token");
  });
});
