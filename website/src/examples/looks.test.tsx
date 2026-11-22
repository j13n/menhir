import { fireEvent, render } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { describe, expect, test } from "vitest";

import type { ComponentExampleProps } from "../components/ComponentExample";
import { looks } from "../looks";

type Rendered = ReturnType<typeof render>;

// Every component's example, from the folders themselves, so that a worked
// example in a look cannot be added without a test here.
const examples = Object.entries(
  import.meta.glob<Record<string, ComponentExampleProps>>("./*/index.ts", {
    eager: true,
  }),
).map(([path, module]) => ({
  slug: path.split("/")[1]!,
  example: Object.values(module)[0]!,
}));

/** What each component's worked example has to render, in any look. */
const renders: Record<string, (rendered: Rendered) => void | Promise<void>> = {
  dialog: ({ getByRole, container }) => {
    expect(getByRole("button", { name: "Edit profile" })).toBeInTheDocument();
    // Closed, so it is out of the accessibility tree.
    expect(container.querySelector("dialog")).toHaveAttribute("data-closed");
  },
  popover: ({ getByRole }) => {
    expect(getByRole("button", { name: "Notifications" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
  switch: async ({ getByRole }) => {
    const control = getByRole("switch", { name: "Wi-Fi" });
    expect(control).toHaveAttribute("data-checked");
    fireEvent.click(control);
    // The switch changes once its click has gone through its hidden input.
    await Promise.resolve();
    flush();
    expect(control).toHaveAttribute("data-unchecked");
  },
  tabs: ({ getByRole, getAllByRole }) => {
    expect(getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Account",
      "Billing",
      "Security",
    ]);
    expect(getByRole("tab", { name: "Account" })).toHaveAttribute(
      "data-selected",
    );
    expect(getByRole("tabpanel")).toHaveTextContent(
      "Your name, email address and language.",
    );
  },
};

describe.each(looks)("the $name look's worked examples", (look) => {
  const worked = examples.filter(({ example }) => example.looks?.[look.name]);

  test("has at least one", () => {
    expect(worked).not.toEqual([]);
  });

  test.each(worked)("$slug renders", async ({ slug, example }) => {
    const variant = example.looks![look.name]!;
    const rendered = render(() => (
      <div data-look={look.name}>{variant.render()}</div>
    ));
    flush();
    // A new worked example needs its case in `renders` above.
    expect(renders).toHaveProperty(slug);
    await renders[slug]!(rendered);
    expect(variant.files.map((file) => file.name)).toContain(
      `${slug[0]!.toUpperCase()}${slug.slice(1)}Example.tsx`,
    );
  });
});
