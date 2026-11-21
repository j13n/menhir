// The test list and the cases left out are in ./README.md.
import { describe, expect, it } from "vitest";

import { For, createSignal, flush } from "solid-js";

import { createRenderer, fireEvent, isJSDOM, screen } from "#test-utils";

import { Tabs } from "./index.ts";

type RootProps = Parameters<typeof Tabs.Root>[0];

// A button before the tabs, three tabs and their panels.
function Settings(
  props: RootProps & { names?: string[]; disabled?: string[] },
) {
  const names = () => props.names ?? ["Account", "Billing", "Security"];
  return (
    <>
      <button>Before</button>
      <Tabs.Root {...props}>
        <Tabs.List aria-label="Settings">
          <For each={names()}>
            {(name) => (
              <Tabs.Tab
                value={name.toLowerCase()}
                disabled={props.disabled?.includes(name)}
              >
                {name}
              </Tabs.Tab>
            )}
          </For>
        </Tabs.List>
        <For each={names()}>
          {(name) => (
            <Tabs.Panel
              value={name.toLowerCase()}
            >{`${name} panel`}</Tabs.Panel>
          )}
        </For>
      </Tabs.Root>
    </>
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });
const panel = (name: string) => screen.getByText(`${name} panel`);

describe("<Tabs /> keyboard", () => {
  const { render } = createRenderer();

  it("is one tab stop, on the selected tab, then moves to its panel", async () => {
    const { user } = await render(() => <Settings defaultValue="billing" />);

    expect(tab("Account")).toHaveAttribute("tabindex", "-1");
    expect(tab("Billing")).toHaveAttribute("tabindex", "0");
    expect(tab("Security")).toHaveAttribute("tabindex", "-1");

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab]");
    expect(tab("Billing")).toHaveFocus();

    await user.keyboard("[Tab]");
    expect(panel("Billing")).toHaveFocus();
  });

  it("returns to the selected tab with Shift+Tab", async () => {
    const { user } = await render(() => <Settings />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight][Tab]");
    expect(panel("Billing")).toHaveFocus();

    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(tab("Billing")).toHaveFocus();
    expect(tab("Billing")).toHaveAttribute("tabindex", "0");
    expect(tab("Account")).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus with Right and Left in a horizontal list, and wraps", async () => {
    const { user } = await render(() => <Settings />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Billing")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(tab("Security")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(tab("Account")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(tab("Security")).toHaveFocus();
    await user.keyboard("[ArrowLeft]");
    expect(tab("Billing")).toHaveFocus();
  });

  it("moves focus with Down and Up in a vertical list, and wraps", async () => {
    const { user } = await render(() => <Settings orientation="vertical" />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowDown]");
    expect(tab("Billing")).toHaveFocus();
    await user.keyboard("[ArrowDown][ArrowDown]");
    expect(tab("Account")).toHaveFocus();
    await user.keyboard("[ArrowUp]");
    expect(tab("Security")).toHaveFocus();
  });

  it.each([
    { orientation: "horizontal", keys: ["ArrowDown", "ArrowUp"] },
    { orientation: "vertical", keys: ["ArrowRight", "ArrowLeft"] },
  ] as const)(
    "ignores the other pair of arrows in a $orientation list",
    async ({ orientation, keys }) => {
      const { user } = await render(() => (
        <Settings orientation={orientation} />
      ));

      await user.click(screen.getByRole("button", { name: "Before" }));
      await user.keyboard("[Tab]");
      for (const key of keys) {
        await user.keyboard(`[${key}]`);
        expect(tab("Account")).toHaveFocus();
        // Left to the page, which scrolls.
        expect(fireEvent.keyDown(tab("Account"), { key })).toBe(true);
      }
    },
  );

  it("focuses the first tab with Home and the last with End", async () => {
    const { user } = await render(() => <Settings />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][End]");
    expect(tab("Security")).toHaveFocus();
    await user.keyboard("[Home]");
    expect(tab("Account")).toHaveFocus();
  });

  it("selects the tab that receives focus, by default", async () => {
    const { user } = await render(() => <Settings />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(tab("Account")).toHaveAttribute("aria-selected", "false");
    expect(panel("Billing")).toBeVisible();
    expect(panel("Account")).not.toBeVisible();

    await user.keyboard("[End]");
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(panel("Security")).toBeVisible();
  });

  it("moves focus only with manual activation, and selects with Enter and Space", async () => {
    const { user } = await render(() => <Settings activation="manual" />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Billing")).toHaveFocus();
    expect(tab("Billing")).toHaveAttribute("aria-selected", "false");
    expect(tab("Account")).toHaveAttribute("aria-selected", "true");
    expect(panel("Account")).toBeVisible();

    await user.keyboard("[Enter]");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "true");
    expect(panel("Billing")).toBeVisible();

    await user.keyboard("[ArrowRight][Space]");
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
    expect(panel("Billing")).not.toBeVisible();
  });

  it("returns to the selected tab, not the last focused one, with manual activation", async () => {
    const { user } = await render(() => <Settings activation="manual" />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab]");

    expect(tab("Account")).toHaveFocus();
  });

  it("moves from a focused tab that is not selected to the panel with Tab, and out of the list with Shift+Tab", async () => {
    const { user } = await render(() => (
      <Settings activation="manual" defaultValue="security" />
    ));

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Account")).toHaveFocus();
    expect(tab("Account")).toHaveAttribute("tabindex", "0");
    expect(tab("Security")).toHaveAttribute("tabindex", "-1");

    await user.keyboard("[Tab]");
    expect(panel("Security")).toHaveFocus();
    expect(tab("Security")).toHaveAttribute("tabindex", "0");

    await user.keyboard("{Shift>}[Tab]{/Shift}[ArrowRight]");
    expect(tab("Account")).toHaveFocus();
    await user.keyboard("{Shift>}[Tab]{/Shift}");
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
  });

  it("stops on a disabled tab without selecting it", async () => {
    const { user } = await render(() => <Settings disabled={["Billing"]} />);

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Billing")).toHaveFocus();
    expect(tab("Billing")).toHaveAttribute("aria-selected", "false");
    expect(tab("Account")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("[Enter][Space]");
    expect(tab("Billing")).toHaveAttribute("aria-selected", "false");

    await user.keyboard("[ArrowRight]");
    expect(tab("Security")).toHaveAttribute("aria-selected", "true");
  });

  it.each(["ArrowRight", "ArrowLeft", "Home", "End"])(
    "cancels the default action of %s",
    async (key) => {
      await render(() => <Settings />);

      expect(fireEvent.keyDown(tab("Account"), { key })).toBe(false);
    },
  );

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"])(
    "leaves arrow keys, Home and End with %s to the browser",
    async (modifier) => {
      await render(() => <Settings />);

      for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
        expect(
          fireEvent.keyDown(tab("Account"), { key, [modifier]: true }),
        ).toBe(true);
      }
    },
  );

  it.skipIf(isJSDOM)(
    "moves to the next tab with Left in a right-to-left list",
    async () => {
      const { user } = await render(() => (
        <div dir="rtl">
          <Settings />
        </div>
      ));

      await user.click(screen.getByRole("button", { name: "Before" }));
      await user.keyboard("[Tab][ArrowLeft]");
      expect(tab("Billing")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(tab("Account")).toHaveFocus();
    },
  );

  it("moves the tab stop to the first tab when the selected tab is removed", async () => {
    const [names, setNames] = createSignal(["Account", "Billing", "Security"]);
    const { user } = await render(() => (
      <Settings names={names()} defaultValue="security" />
    ));
    expect(tab("Security")).toHaveAttribute("tabindex", "0");

    setNames(["Account", "Billing"]);
    flush();

    expect(tab("Account")).toHaveAttribute("tabindex", "0");
    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab]");
    expect(tab("Account")).toHaveFocus();
  });

  it("puts a tab added later in the order of the document", async () => {
    const [names, setNames] = createSignal(["Account", "Security"]);
    const { user } = await render(() => <Settings names={names()} />);

    setNames(["Account", "Billing", "Security"]);
    flush();
    expect(tab("Billing")).toHaveAttribute("tabindex", "-1");

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.keyboard("[Tab][ArrowRight]");
    expect(tab("Billing")).toHaveFocus();
    await user.keyboard("[ArrowRight]");
    expect(tab("Security")).toHaveFocus();
  });
});
