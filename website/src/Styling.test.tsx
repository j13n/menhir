import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

// Kept outside src/routes so the file-system router never sees it as a page.
import Styling from "./routes/docs/styling";

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

  test("names the shipped look and links to its worked examples", () => {
    const { getByRole } = render(() => <Styling />);
    const looks = getByRole("region", { name: "Looks" });
    expect(looks).toHaveTextContent("shadcn look");
    const links = [...looks.querySelectorAll("a")].map((link) =>
      link.getAttribute("href"),
    );
    expect(links).toEqual([
      "/docs/components/switch",
      "/docs/components/dialog",
      "/docs/components/tabs",
      "/docs/components/popover",
    ]);
  });

  test("says how to give an agent the skill", () => {
    const { getByRole } = render(() => <Styling />);
    const install = getByRole("region", { name: "Give your agent the skill" });
    const [instructions, copy] = [...install.querySelectorAll("pre code")].map(
      (code) => code.textContent,
    );
    expect(instructions).toBe(
      "To style Menhir components, follow node_modules/menhir/skills/menhir-styling/SKILL.md.",
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
    expect(use.querySelectorAll("ol > li")).toHaveLength(4);
  });

  test("covers a look of the app's own, and an app without Tailwind CSS", () => {
    const { getByRole } = render(() => <Styling />);
    expect(
      getByRole("region", { name: "A look of your own" }),
    ).toHaveTextContent("writes that look's tokens first");
    expect(
      getByRole("region", { name: "Plain CSS instead of Tailwind CSS" }),
    ).toHaveTextContent("token for token");
  });
});
