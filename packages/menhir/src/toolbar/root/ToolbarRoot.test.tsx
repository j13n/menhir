// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createSignal, flush } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Toolbar } from "../index.ts";

describeConformance(
  "<Toolbar.Root />",
  (props) => (
    <Toolbar.Root {...props}>
      <Toolbar.Button>Bold</Toolbar.Button>
    </Toolbar.Root>
  ),
  { tagName: "DIV" },
);

describe("<Toolbar.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with role toolbar", async () => {
    await render(() => (
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Bold</Toolbar.Button>
      </Toolbar.Root>
    ));

    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    expect(toolbar.tagName).toBe("DIV");
  });

  it.each(["aria-label", "aria-labelledby"])(
    "passes %s through",
    async (name) => {
      await render(() => (
        <Toolbar.Root {...{ [name]: "formatting" }}>
          <Toolbar.Button>Bold</Toolbar.Button>
        </Toolbar.Root>
      ));

      expect(screen.getByRole("toolbar")).toHaveAttribute(name, "formatting");
    },
  );

  it("has aria-orientation only when vertical, and data attributes for either", async () => {
    const [orientation, setOrientation] = createSignal<
      "horizontal" | "vertical" | undefined
    >();
    await render(() => (
      <Toolbar.Root aria-label="Formatting" orientation={orientation()}>
        <Toolbar.Button>Bold</Toolbar.Button>
      </Toolbar.Root>
    ));
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).not.toHaveAttribute("aria-orientation");
    expect(toolbar).toHaveAttribute("data-horizontal", "");
    expect(toolbar).not.toHaveAttribute("data-vertical");

    setOrientation("vertical");
    flush();
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar).toHaveAttribute("data-vertical", "");
    expect(toolbar).not.toHaveAttribute("data-horizontal");

    setOrientation("horizontal");
    flush();
    expect(toolbar).not.toHaveAttribute("aria-orientation");
    expect(toolbar).toHaveAttribute("data-horizontal", "");
  });

  it("disables every item, which stays focusable, and follows changes", async () => {
    const [disabled, setDisabled] = createSignal(true);
    await render(() => (
      <Toolbar.Root aria-label="Formatting" disabled={disabled()}>
        <Toolbar.Button>Bold</Toolbar.Button>
        <Toolbar.Link href="#help">Help</Toolbar.Link>
        <Toolbar.Input aria-label="Size" />
      </Toolbar.Root>
    ));
    const toolbar = screen.getByRole("toolbar");
    const items = [
      screen.getByRole("button", { name: "Bold" }),
      screen.getByRole("link", { name: "Help" }),
      screen.getByRole("textbox", { name: "Size" }),
    ];
    expect(toolbar).toHaveAttribute("data-disabled", "");
    for (const item of items) {
      expect(item).toHaveAttribute("aria-disabled", "true");
      expect(item).toHaveAttribute("data-disabled", "");
      expect(item).not.toBeDisabled();
    }

    setDisabled(false);
    flush();
    expect(toolbar).not.toHaveAttribute("data-disabled");
    for (const item of items) {
      expect(item).not.toHaveAttribute("aria-disabled");
      expect(item).not.toHaveAttribute("data-disabled");
    }
  });
});
