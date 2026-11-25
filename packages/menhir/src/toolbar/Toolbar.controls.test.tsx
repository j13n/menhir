// Controls of other components inside a toolbar, joined through `render`.
// The test list and the cases left out are in ./README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { For, createSignal } from "solid-js";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { keyboard } from "../../test/floating/input.ts";
import { stubMenu } from "../../test/menu/stubMenu.ts";
import { Input } from "../input/index.ts";
import { Menu } from "../menu/index.ts";
import { Popover } from "../popover/index.ts";
import { Select } from "../select/index.ts";
import { Toggle } from "../toggle/index.ts";
import { ToggleGroup } from "../toggle-group/index.ts";
import { Toolbar } from "./index.ts";

const button = (name: string) => screen.getByRole("button", { name });

describe("<Toolbar /> with other components' controls", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  describe("Toggle", () => {
    it("joins the tab stop and the arrow keys, and presses with Space", async () => {
      const { user } = await render(() => (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button render={Toggle.Root}>Bold</Toolbar.Button>
          <Toolbar.Button render={Toggle.Root}>Italic</Toolbar.Button>
        </Toolbar.Root>
      ));

      expect(button("Bold")).toHaveAttribute("tabindex", "0");
      expect(button("Italic")).toHaveAttribute("tabindex", "-1");
      await user.keyboard("[Tab][ArrowRight][Space]");
      expect(button("Italic")).toHaveFocus();
      expect(button("Italic")).toHaveAttribute("aria-pressed", "true");
      expect(button("Bold")).toHaveAttribute("aria-pressed", "false");
    });

    it("stays focusable when disabled, and neither a click nor Space presses it", async () => {
      const onPressedChange = vi.fn();
      const { user } = await render(() => (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Undo</Toolbar.Button>
          <Toolbar.Button
            disabled
            render={(p) => (
              <Toggle.Root {...p} onPressedChange={onPressedChange} />
            )}
          >
            Bold
          </Toolbar.Button>
        </Toolbar.Root>
      ));

      await user.keyboard("[Tab][ArrowRight]");
      expect(button("Bold")).toHaveFocus();
      expect(button("Bold")).toHaveAttribute("aria-disabled", "true");
      await user.keyboard("[Space][Enter]");
      await user.click(button("Bold"));
      expect(onPressedChange).not.toHaveBeenCalled();
      expect(button("Bold")).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Toggle Group", () => {
    function Alignment(props: { orientation?: "horizontal" | "vertical" }) {
      return (
        <>
          <button>Before</button>
          <Toolbar.Root aria-label="Formatting">
            <Toolbar.Button>Bold</Toolbar.Button>
            <ToggleGroup.Root
              aria-label="Alignment"
              orientation={props.orientation}
            >
              <For each={["Left", "Center", "Right"]}>
                {(name) => (
                  <Toolbar.Button
                    render={(p) => (
                      <ToggleGroup.Item {...p} value={name.toLowerCase()} />
                    )}
                  >
                    {name}
                  </Toolbar.Button>
                )}
              </For>
            </ToggleGroup.Root>
            <Toolbar.Button>Help</Toolbar.Button>
          </Toolbar.Root>
          <button>After</button>
        </>
      );
    }

    it("makes its items the toolbar's: one tab stop, and arrow keys through the group", async () => {
      const { user } = await render(() => <Alignment />);

      const tabStops = screen
        .getAllByRole("button")
        .filter((element) => element.tabIndex === 0);
      expect(tabStops.map((element) => element.textContent)).toEqual([
        "Before",
        "Bold",
        "After",
      ]);

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowRight]");
      expect(button("Left")).toHaveFocus();
      await user.keyboard("[ArrowRight][ArrowRight]");
      expect(button("Right")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Bold")).toHaveFocus();
      await user.keyboard("[ArrowLeft][ArrowLeft]");
      expect(button("Right")).toHaveFocus();

      await user.keyboard("[Space]");
      expect(button("Right")).toHaveAttribute("aria-pressed", "true");
      await user.keyboard("[Tab]");
      expect(button("After")).toHaveFocus();
      await user.keyboard("{Shift>}[Tab]{/Shift}");
      expect(button("Right")).toHaveFocus();
    });

    it("keeps Down and Up among its items when vertical in a horizontal toolbar", async () => {
      const { user } = await render(() => <Alignment orientation="vertical" />);

      await user.click(button("Before"));
      await user.keyboard("[Tab][ArrowRight]");
      expect(button("Left")).toHaveFocus();
      await user.keyboard("[ArrowDown]");
      expect(button("Center")).toHaveFocus();
      await user.keyboard("[ArrowDown][ArrowDown]");
      expect(button("Left")).toHaveFocus();
      await user.keyboard("[ArrowUp]");
      expect(button("Right")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
    });
  });

  describe("Menu", () => {
    function Font(props: { disabled?: boolean; onOpenChange?: () => void }) {
      return (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Menu.Root onOpenChange={props.onOpenChange}>
            <Toolbar.Button disabled={props.disabled} render={Menu.Trigger}>
              Font
            </Toolbar.Button>
            <Menu.Popup aria-label="Font">
              <Menu.Item>Serif</Menu.Item>
              <Menu.Item>Sans</Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <Toolbar.Button>Help</Toolbar.Button>
        </Toolbar.Root>
      );
    }
    const item = (name: string) => screen.getByRole("menuitem", { name });

    it("passes its Trigger with Right and Left, and opens on Down", async () => {
      const { user } = await render(() => <Font />);

      await user.keyboard("[Tab][ArrowRight]");
      expect(button("Font")).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
      await user.keyboard("[ArrowLeft][ArrowDown]");
      expect(item("Serif")).toHaveFocus();
    });

    it("leaves the keys in the open menu to the menu", async () => {
      const { user } = await render(() => <Font />);

      await user.keyboard("[Tab][ArrowRight][ArrowDown][ArrowRight]");
      expect(item("Serif")).toHaveFocus();
      await user.keyboard("[End]");
      expect(item("Sans")).toHaveFocus();
    });

    it.skipIf(isJSDOM)("returns focus to its Trigger on Escape", async () => {
      const { user } = await render(() => <Font />);

      await user.keyboard("[Tab][ArrowRight][ArrowDown]");
      expect(item("Serif")).toHaveFocus();
      await keyboard("{Escape}");
      await vi.waitFor(() => expect(button("Font")).toHaveFocus());
      expect(button("Font")).toHaveAttribute("aria-expanded", "false");
    });

    it("stays focusable with a disabled Trigger, which neither a click nor Down opens", async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => (
        <Font disabled onOpenChange={onOpenChange} />
      ));

      await user.keyboard("[Tab][ArrowRight]");
      expect(button("Font")).toHaveFocus();
      await user.keyboard("[ArrowDown][Enter][Space]");
      await user.click(button("Font"));
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(button("Font")).toHaveAttribute("aria-expanded", "false");
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
    });
  });

  describe("Popover", () => {
    it("moves on from its Trigger with Right and Left while it is open", async () => {
      const { user } = await render(() => (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Popover.Root defaultOpen>
            <Toolbar.Button render={Popover.Trigger}>Colour</Toolbar.Button>
            <Popover.Popup aria-label="Colour">Pick a colour</Popover.Popup>
          </Popover.Root>
          <Toolbar.Button>Help</Toolbar.Button>
        </Toolbar.Root>
      ));

      expect(button("Colour")).toHaveAttribute("aria-expanded", "true");
      button("Colour").focus();
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
      await user.keyboard("[ArrowLeft][ArrowLeft]");
      expect(button("Bold")).toHaveFocus();
    });
  });

  describe("Select", () => {
    function Size() {
      return (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Select.Root defaultValue="12">
            <Toolbar.Button aria-label="Size" render={Select.Trigger}>
              <Select.Value />
            </Toolbar.Button>
            <Select.Popup>
              <Select.Item value="10">10</Select.Item>
              <Select.Item value="12">12</Select.Item>
              <Select.Item value="14">14</Select.Item>
            </Select.Popup>
          </Select.Root>
          <Toolbar.Button>Help</Toolbar.Button>
        </Toolbar.Root>
      );
    }
    const trigger = () => screen.getByRole("combobox", { name: "Size" });
    const active = () =>
      document.getElementById(trigger().getAttribute("aria-activedescendant")!);

    it("passes its Trigger with Right and Left, and opens on Down", async () => {
      const { user } = await render(() => <Size />);

      await user.keyboard("[Tab][ArrowRight]");
      expect(trigger()).toHaveFocus();
      await user.keyboard("[ArrowRight]");
      expect(button("Help")).toHaveFocus();
      await user.keyboard("[ArrowLeft][ArrowDown]");
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
      expect(trigger()).toHaveFocus();
    });

    it("leaves every key to the Select while its list is open", async () => {
      const { user } = await render(() => <Size />);

      await user.keyboard("[Tab][ArrowRight][ArrowDown]");
      expect(active()).toHaveTextContent("12");
      for (const key of ["ArrowRight", "ArrowLeft", "Home", "End"]) {
        await user.keyboard(`[${key}]`);
        expect(trigger()).toHaveFocus();
      }
      // End moved to the last item, in the Select's list.
      expect(active()).toHaveTextContent("14");
      await user.keyboard("[Home]");
      expect(active()).toHaveTextContent("10");
    });
  });

  describe("Input", () => {
    it("joins as Toolbar.Input's render and keeps its caret keys", async () => {
      const [text, setText] = createSignal("Serif");
      const { user } = await render(() => (
        <Toolbar.Root aria-label="Formatting">
          <Toolbar.Button>Bold</Toolbar.Button>
          <Toolbar.Input
            aria-label="Font"
            render={(p) => (
              <Input.Root {...p} value={text()} onValueChange={setText} />
            )}
          />
        </Toolbar.Root>
      ));
      const field = () => screen.getByRole("textbox") as HTMLInputElement;

      expect(field()).toHaveAttribute("tabindex", "-1");
      await user.keyboard("[Tab][ArrowRight]");
      expect(field()).toHaveFocus();
      field().setSelectionRange(5, 5);
      await user.keyboard("[ArrowLeft][ArrowLeft]x");
      expect(field()).toHaveFocus();
      expect(field()).toHaveValue("Serxif");
      await user.keyboard("[Home][ArrowLeft]");
      expect(button("Bold")).toHaveFocus();
    });
  });
});
