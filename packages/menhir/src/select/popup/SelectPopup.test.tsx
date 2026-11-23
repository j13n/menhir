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
  keyboard,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Fruit } from "../../../test/select/Fruit.tsx";
import {
  active,
  item,
  popup,
  selected,
  shown,
  trigger,
} from "../../../test/select/queries.ts";
import { Select } from "../index.ts";

const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

// A 60 by 20 Trigger fixed at (200, 200).
const fixedTrigger = () => (
  <Select.Trigger
    id="fruit"
    style={{
      position: "fixed",
      left: "200px",
      top: "200px",
      width: "60px",
      height: "20px",
      margin: 0,
      padding: 0,
      border: 0,
    }}
  />
);
const popupStyle = {
  width: "100px",
  height: "60px",
  padding: "0",
  border: "0",
};

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

describeConformance(
  "<Select.Popup />",
  (props) => (
    <Select.Root>
      <Select.Popup {...props} />
    </Select.Root>
  ),
  { tagName: "DIV" },
);

describe("<Select.Popup />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a popover with the listbox role and the Root's id, hidden until opened", async () => {
    const { user } = await render(() => <Fruit />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "auto");
    expect(trigger()).toHaveAttribute("popovertarget", popup().id);
    expect(shown()).toBe(false);

    await user.click(trigger());
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it("is labelled by the Trigger, and the consumer's aria-labelledby wins", async () => {
    await render(() => (
      <>
        <Fruit />
        <Select.Root>
          <Select.Trigger aria-label="Mine" />
          <Select.Popup aria-labelledby="own" data-testid="own" />
        </Select.Root>
        <span id="own">Own label</span>
      </>
    ));

    expect(document.getElementById("fruit")).toBe(
      screen.getByRole("combobox", { name: "Fruit" }),
    );
    expect(screen.getAllByRole("listbox", { hidden: true })[0]).toHaveAttribute(
      "aria-labelledby",
      "fruit",
    );
    expect(screen.getByTestId("own")).toHaveAttribute("aria-labelledby", "own");
  });

  it("carries data-open or data-closed, data-disabled and data-required", async () => {
    await render(() => <Fruit defaultOpen disabled required />);
    await afterFlush();

    expect(popup()).toHaveAttribute("data-open", "");
    expect(popup()).not.toHaveAttribute("data-closed");
    expect(popup()).toHaveAttribute("data-disabled", "");
    expect(popup()).toHaveAttribute("data-required", "");
  });

  it.skipIf(isJSDOM)(
    "is in the top layer and not modal: a button outside can still be pressed",
    async () => {
      const onClick = vi.fn();
      await render(() => (
        <>
          <Fruit defaultOpen />
          <button type="button" onClick={onClick}>
            Elsewhere
          </button>
        </>
      ));
      await nextTask();

      expect(shown()).toBe(true);
      expect(popup().matches(":modal")).toBe(false);
      await press(centerOf(button("Elsewhere")));
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  it.skipIf(isJSDOM)(
    "is placed below its Trigger, aligned to its start",
    async () => {
      await render(() => (
        <Fruit
          defaultOpen
          trigger={fixedTrigger()}
          popup={{ style: popupStyle }}
        />
      ));
      await frames();

      expect(popup()).toHaveAttribute("data-side", "bottom");
      expect(popup()).toHaveAttribute("data-align", "start");
      const box = popup().getBoundingClientRect();
      expect([box.left, box.top]).toEqual([200, 220]);
    },
  );

  it.skipIf(isJSDOM)("takes side, align and the offsets", async () => {
    await render(() => (
      <Fruit
        defaultOpen
        trigger={fixedTrigger()}
        popup={{
          style: popupStyle,
          side: "right",
          align: "end",
          sideOffset: 4,
          alignOffset: 2,
        }}
      />
    ));
    await frames();

    expect(popup()).toHaveAttribute("data-side", "right");
    expect(popup()).toHaveAttribute("data-align", "end");
    const box = popup().getBoundingClientRect();
    // Right of the Trigger by 4, its bottom at the Trigger's, moved up by 2.
    expect([box.left, box.bottom]).toEqual([264, 218]);
  });

  it.skipIf(isJSDOM)(
    "writes --anchor-width and --available-height, so CSS can match the Trigger's width and limit the height",
    async () => {
      await render(() => (
        <Fruit
          defaultOpen
          trigger={fixedTrigger()}
          popup={{
            style: {
              padding: "0",
              border: "0",
              "box-sizing": "border-box",
              width: "var(--anchor-width)",
              "max-height": "var(--available-height)",
              "overflow-y": "auto",
            },
          }}
        >
          {Array.from({ length: 200 }, (_, index) => (
            <Select.Item value={`item-${index}`} style={{ height: "20px" }}>
              Item {index}
            </Select.Item>
          ))}
        </Fruit>
      ));
      await frames();

      const box = popup().getBoundingClientRect();
      expect(box.width).toBe(60);
      // From the Trigger's bottom edge to 5 pixels above the viewport's.
      expect(box.top).toBe(220);
      expect(box.bottom).toBe(window.innerHeight - 5);
      // The list is longer than the space, so it scrolls.
      expect(popup().scrollHeight).toBeGreaterThan(box.height);
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Escape, reporting escape-key, keeps the value and leaves focus on the Trigger",
    async () => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Fruit
          defaultValue="apple"
          onOpenChange={onOpenChange}
          onValueChange={onValueChange}
        />
      ));
      await user.click(trigger());
      await nextTask();
      await keyboard("{ArrowDown}");
      expect(active()).toBe("Banana");

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "escape-key",
        event: expect.any(KeyboardEvent),
      });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(selected()).toEqual(["Apple"]);
      expect(document.activeElement).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "closes on a press outside, reporting outside-press",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Fruit defaultOpen onOpenChange={onOpenChange} />);
      await nextTask();

      await press(centerOf(button("After")));
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "outside-press",
        event: expect.any(PointerEvent),
      });
    },
  );

  it.skipIf(isJSDOM)(
    "leaves focus on the Trigger when an item is pressed",
    async () => {
      const onValueChange = vi.fn();
      await render(() => <Fruit onValueChange={onValueChange} />);
      await press(centerOf(trigger()));
      await nextTask();
      expect(document.activeElement).toBe(trigger());

      await press(centerOf(item("Banana")));
      await nextTask();

      expect(onValueChange).toHaveBeenCalledWith("banana");
      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "selects the active item on Tab, closes reporting focus-out, and focus moves to the element after the Trigger",
    async () => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      const { user } = await render(() => (
        <Fruit onOpenChange={onOpenChange} onValueChange={onValueChange} />
      ));
      await user.click(trigger());
      await nextTask();
      await keyboard("{ArrowDown}");

      await keyboard("{Tab}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(onValueChange).toHaveBeenCalledWith("banana");
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "focus-out",
        event: expect.any(KeyboardEvent),
      });
      expect(document.activeElement).toBe(button("After"));
    },
  );

  it("throws a descriptive error outside Select.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Select.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Select parts must be placed within <Select.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
