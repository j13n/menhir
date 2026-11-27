import { fireEvent, render, within } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, test } from "vitest";

import look from "./looks/shadcn/LOOK.md?raw";
// Kept outside src/routes so the file-system router never sees it as a page.
import Badge from "./routes/docs/badge";

describe("badge page", () => {
  test("says a badge is a styled span, not a component", () => {
    const { getByRole } = render(() => <Badge />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Badge");
    const section = getByRole("region", { name: "A styled span" });
    expect(section).toHaveTextContent("Menhir has no Badge component");
    expect(section.querySelector("pre code")).toHaveTextContent("<span class=");
  });

  test("shows each variant of the shadcn look's badge, with the classes of its recipe", () => {
    const { getByRole } = render(() => <Badge />);
    const section = getByRole("region", { name: "A styled span" });
    const badges = [...section.querySelectorAll("[data-look=shadcn] span")];
    expect(badges.map((badge) => badge.textContent)).toEqual([
      "New",
      "Draft",
      "Failed",
      "Beta",
    ]);
    // Each badge is the recipe's own classes and then one variant's, as
    // LOOK.md writes them.
    const recipe = look.match(/^- \*\*Badges\*\*.*?(?=^- \*\*)/ms)![0];
    const base = recipe.match(/`(inline-flex [^`]+)`/)![1];
    const variants = ["primary", "secondary", "destructive", "outline"].map(
      (name) =>
        recipe.match(new RegExp(`^  - ${name}: \`([^\`]+)\`$`, "m"))![1],
    );
    expect(badges.map((badge) => badge.getAttribute("class"))).toEqual(
      variants.map((variant) => `${base} ${variant}`),
    );
  });

  test("announces a count that changes through a status that is there before it changes", async () => {
    const { getByRole } = render(() => <Badge />);
    const region = within(
      getByRole("region", { name: "A count that changes" }),
    );
    const status = region.getByRole("status");
    expect(status).toHaveTextContent("2 unread messages");
    fireEvent.click(region.getByRole("button", { name: "Receive a message" }));
    flush();
    // The same element, so a screen reader announces its new text.
    expect(region.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("3 unread messages");
  });

  test("makes a count on an icon button part of the button's name", () => {
    const { getByRole } = render(() => <Badge />);
    const region = within(
      getByRole("region", { name: "A count on an icon button" }),
    );
    expect(
      region.getByRole("button", { name: "Messages, 3 unread" }),
    ).toBeInTheDocument();
    expect(region.queryByRole("status")).toBeNull();
  });

  test("says a badge needs text, not colour alone, and that a multi combobox's chips are not badges", () => {
    const { getByRole } = render(() => <Badge />);
    const colour = getByRole("region", { name: "Colour that means something" });
    expect(colour).toHaveTextContent("WCAG 1.4.1");
    const chips = getByRole("region", { name: "Chips are not badges" });
    expect(
      within(chips).getByRole("link", { name: "Multi Combobox" }),
    ).toHaveAttribute("href", "/docs/components/multi-combobox");
  });
});
