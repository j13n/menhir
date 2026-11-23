// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import {
  centerOf,
  movePointer,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { City } from "../../../test/autocomplete/City.tsx";
import {
  active,
  input,
  item,
  shown,
} from "../../../test/autocomplete/queries.ts";
import { Autocomplete } from "../index.ts";

describeConformance(
  "<Autocomplete.Item />",
  (props) => (
    <Autocomplete.Root>
      <Autocomplete.Item value="Oslo" {...props} />
    </Autocomplete.Root>
  ),
  { tagName: "DIV" },
);

describe("<Autocomplete.Item />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders an option with an id, the consumer's if given, and no aria-selected while not active", async () => {
    await render(() => (
      <City defaultOpen>
        <Autocomplete.Item value="Oslo">Oslo</Autocomplete.Item>
        <Autocomplete.Item value="Bergen" id="bergen">
          Bergen
        </Autocomplete.Item>
      </City>
    ));
    await afterFlush();

    expect(item("Oslo").tagName).toBe("DIV");
    expect(item("Oslo").id).not.toBe("");
    expect(item("Bergen").id).toBe("bergen");
    for (const name of ["Oslo", "Bergen"]) {
      expect(item(name)).not.toHaveAttribute("aria-selected");
      expect(item(name)).not.toHaveAttribute("data-selected");
      expect(item(name)).not.toHaveAttribute("data-active");
    }
  });

  it("has aria-selected true and data-active while it is the active item of an open list", async () => {
    const { user } = await render(() => <City />);
    await user.type(input(), "b");
    await user.keyboard("{ArrowDown}");

    expect(active()).toBe("Bergen");
    expect(item("Bergen")).toHaveAttribute("aria-selected", "true");
    expect(item("Bergen")).toHaveAttribute("data-active", "");
    expect(item("Bodø")).not.toHaveAttribute("aria-selected");

    await user.keyboard("{Escape}");
    await afterFlush();
    expect(item("Bergen")).not.toHaveAttribute("aria-selected");
    expect(item("Bergen")).not.toHaveAttribute("data-active");
  });

  it("accepts the item on a click: the text becomes its value and the list closes", async () => {
    const onOpenChange = vi.fn();
    const { user } = await render(() => <City onOpenChange={onOpenChange} />);
    await user.type(input(), "o");
    await afterFlush();

    await user.click(item("Trondheim"));
    await afterFlush();

    expect(input()).toHaveValue("Trondheim");
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, {
      reason: "item-press",
      event: expect.any(MouseEvent),
    });
  });

  it("fills in its value when its content differs", async () => {
    const { user } = await render(() => (
      <City defaultOpen>
        <Autocomplete.Item value="Oslo">
          <span aria-hidden="true">📍</span> Oslo, Norway
        </Autocomplete.Item>
      </City>
    ));
    await afterFlush();

    await user.click(screen.getByRole("option", { hidden: true }));
    await afterFlush();

    expect(input()).toHaveValue("Oslo");
  });

  it("keeps a disabled item reachable but does not accept it", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <City defaultOpen onValueChange={onValueChange}>
        <Autocomplete.Item value="Oslo" disabled>
          Oslo
        </Autocomplete.Item>
      </City>
    ));
    await afterFlush();
    expect(item("Oslo")).toHaveAttribute("aria-disabled", "true");
    expect(item("Oslo")).toHaveAttribute("data-disabled", "");

    await user.click(item("Oslo"));
    input().focus();
    await user.keyboard("{ArrowDown}");
    expect(active()).toBe("Oslo");
    await user.keyboard("{Enter}");
    await afterFlush();

    expect(onValueChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue("");
  });

  it.skipIf(isJSDOM)(
    "makes the item the pointer moves onto active",
    async () => {
      const { user } = await render(() => <City />);
      await user.type(input(), "b");
      await nextTask();

      await movePointer([centerOf(item("Bodø"))]);

      expect(active()).toBe("Bodø");
      expect(document.activeElement).toBe(input());
    },
  );

  it.skipIf(isJSDOM)(
    "leaves focus in the input on a press, and fills it in",
    async () => {
      const { user } = await render(() => <City />);
      await user.type(input(), "b");
      await nextTask();

      await press(centerOf(item("Bodø")));
      await afterFlush();

      expect(document.activeElement).toBe(input());
      expect(input()).toHaveValue("Bodø");
      expect(shown()).toBe(false);
    },
  );

  it("throws a descriptive error outside Autocomplete.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Autocomplete.Item value="Oslo" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Autocomplete parts must be placed within <Autocomplete.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
