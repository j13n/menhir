// The test list and the cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { Edit } from "../../../test/menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";
import type { MenuCheckboxItemProps } from "./MenuCheckboxItem.tsx";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const wrap = () =>
  screen.getByRole("menuitemcheckbox", { name: "Word wrap", hidden: true });

function View(
  props: Omit<MenuCheckboxItemProps, "children"> & {
    onOpenChange?: () => void;
  },
) {
  return (
    <Edit defaultOpen onOpenChange={props.onOpenChange}>
      <Menu.CheckboxItem
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        onCheckedChange={props.onCheckedChange}
      >
        <Menu.ItemIndicator data-testid="indicator">✓</Menu.ItemIndicator>
        Word wrap
      </Menu.CheckboxItem>
    </Edit>
  );
}

describeConformance(
  "<Menu.CheckboxItem />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.CheckboxItem {...props} />
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Menu.ItemIndicator />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.CheckboxItem>
          <Menu.ItemIndicator {...props} />
        </Menu.CheckboxItem>
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Menu.CheckboxItem />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a menuitemcheckbox with aria-checked and data-checked or data-unchecked", async () => {
    await render(() => <View />);

    expect(wrap()).toHaveAttribute("aria-checked", "false");
    expect(wrap()).toHaveAttribute("data-unchecked", "");
    expect(wrap()).not.toHaveAttribute("data-checked");
  });

  it("checks on a click and closes the menu; onCheckedChange gets the value", async () => {
    const onCheckedChange = vi.fn();
    const onOpenChange = vi.fn();
    const { user } = await render(() => (
      <View onCheckedChange={onCheckedChange} onOpenChange={onOpenChange} />
    ));
    await vi.waitFor(() => expect(document.activeElement).toBe(wrap()));

    await user.click(wrap());
    await afterFlush();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(wrap()).toHaveAttribute("aria-checked", "true");
    expect(wrap()).toHaveAttribute("data-checked", "");
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
  });

  it("changes on Space and keeps the menu open, and on Enter and closes it", async () => {
    const { user } = await render(() => <View defaultChecked />);
    await vi.waitFor(() => expect(document.activeElement).toBe(wrap()));

    await user.keyboard(" ");
    await afterFlush();
    expect(wrap()).toHaveAttribute("aria-checked", "false");
    expect(shown()).toBe(true);

    await user.keyboard("{Enter}");
    await afterFlush();
    expect(wrap()).toHaveAttribute("aria-checked", "true");
    expect(shown()).toBe(false);
  });

  it("only asks when controlled", async () => {
    const onCheckedChange = vi.fn();
    const { user } = await render(() => (
      <View checked={false} onCheckedChange={onCheckedChange} />
    ));
    await vi.waitFor(() => expect(document.activeElement).toBe(wrap()));

    await user.keyboard(" ");
    await afterFlush();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(wrap()).toHaveAttribute("aria-checked", "false");
  });

  it("has an ItemIndicator that carries its state and is aria-hidden", async () => {
    const { user } = await render(() => <View />);
    const indicator = screen.getByTestId("indicator");
    expect(indicator.tagName).toBe("SPAN");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(indicator).toHaveAttribute("data-unchecked", "");
    await vi.waitFor(() => expect(document.activeElement).toBe(wrap()));

    await user.keyboard(" ");
    await afterFlush();

    expect(indicator).toHaveAttribute("data-checked", "");
    expect(indicator).not.toHaveAttribute("data-unchecked");
    expect(wrap()).toHaveAccessibleName("Word wrap");
  });
});
