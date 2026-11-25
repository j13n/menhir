// The test list and the cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  screen,
} from "#test-utils";

import { menuKinds } from "../../../test/menu/kinds.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";
import type { MenuRadioGroupProps } from "./MenuRadioGroup.tsx";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const radio = (name: string) =>
  screen.getByRole("menuitemradio", { name, hidden: true });

describeConformance(
  "<Menu.RadioGroup />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.RadioGroup {...props} />
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describeConformance(
  "<Menu.RadioItem />",
  (props) => (
    <Menu.Root>
      <Menu.Popup>
        <Menu.RadioGroup>
          <Menu.RadioItem value="a" {...props} />
        </Menu.RadioGroup>
      </Menu.Popup>
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describe.each(menuKinds)("<Menu.RadioGroup /> in a $name", (kind) => {
  const { parts, Edit } = kind;

  function Sort(props: Omit<MenuRadioGroupProps, "children">) {
    return (
      <Edit defaultOpen>
        <parts.RadioGroup
          value={props.value}
          defaultValue={props.defaultValue}
          onValueChange={props.onValueChange}
        >
          <parts.GroupLabel>Sort by</parts.GroupLabel>
          <parts.RadioItem value="name">
            <parts.ItemIndicator data-testid="name-indicator" />
            Name
          </parts.RadioItem>
          <parts.RadioItem value="date">Date</parts.RadioItem>
        </parts.RadioGroup>
      </Edit>
    );
  }

  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a group named by its GroupLabel, with menuitemradio items", async () => {
    await render(() => <Sort />);

    const group = screen.getByRole("group", { hidden: true });
    expect(group.tagName).toBe("DIV");
    expect(group).toHaveAccessibleName("Sort by");
    expect(radio("Name")).toHaveAttribute("aria-checked", "false");
    expect(radio("Name")).toHaveAttribute("data-unchecked", "");
  });

  it("checks a RadioItem on a click, unchecking the others, and closes the menu; onValueChange gets the value", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Sort defaultValue="name" onValueChange={onValueChange} />
    ));
    expect(radio("Name")).toHaveAttribute("aria-checked", "true");
    expect(radio("Name")).toHaveAttribute("data-checked", "");
    expect(screen.getByTestId("name-indicator")).toHaveAttribute(
      "data-checked",
      "",
    );

    await user.click(radio("Date"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("date");
    expect(radio("Date")).toHaveAttribute("aria-checked", "true");
    expect(radio("Name")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("name-indicator")).toHaveAttribute(
      "data-unchecked",
      "",
    );
    expect(shown()).toBe(false);
  });

  it("checks a RadioItem on Space and keeps the menu open", async () => {
    const { user } = await render(() => <Sort />);
    await vi.waitFor(() => expect(document.activeElement).toBe(radio("Name")));

    await user.keyboard("{ArrowDown} ");
    await afterFlush();

    expect(radio("Date")).toHaveAttribute("aria-checked", "true");
    expect(shown()).toBe(true);
  });

  it("only asks when controlled, and null checks none", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <Sort value={null} onValueChange={onValueChange} />
    ));

    await user.click(radio("Date"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("date");
    expect(radio("Date")).toHaveAttribute("aria-checked", "false");
    expect(radio("Name")).toHaveAttribute("aria-checked", "false");
  });
});
