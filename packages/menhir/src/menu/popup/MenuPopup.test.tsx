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
import { Edit } from "../../../test/menu/Edit.tsx";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Menu } from "../index.ts";

const popup = () => screen.getByRole("menu", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Edit" });
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const item = (name: string) =>
  screen.getByRole("menuitem", { name, hidden: true });

// A 40 by 20 Trigger fixed at (200, 200), and a 100 by 60 Popup.
const fixedTrigger = () => (
  <Menu.Trigger
    style={{
      position: "fixed",
      left: "200px",
      top: "200px",
      width: "40px",
      height: "20px",
      margin: 0,
      padding: 0,
      border: 0,
    }}
  >
    Edit
  </Menu.Trigger>
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
  "<Menu.Popup />",
  (props) => (
    <Menu.Root>
      <Menu.Popup {...props} />
    </Menu.Root>
  ),
  { tagName: "DIV" },
);

describe("<Menu.Popup />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a popover with the menu role and the Root's id, hidden until opened", async () => {
    const { user } = await render(() => <Edit />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "auto");
    expect(trigger()).toHaveAttribute("popovertarget", popup().id);
    expect(shown()).toBe(false);

    await user.click(trigger());
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it("is labelled by its Trigger, and the consumer's aria-labelledby wins", async () => {
    await render(() => (
      <>
        <Edit />
        <Menu.Root defaultOpen>
          <Menu.Trigger>Mine</Menu.Trigger>
          <Menu.Popup aria-labelledby="own" data-testid="own" />
        </Menu.Root>
        <span id="own">Own label</span>
      </>
    ));

    const edit = document.getElementById(
      trigger().getAttribute("aria-controls")!,
    )!;
    expect(edit).toHaveAttribute("aria-labelledby", trigger().id);
    expect(screen.getByTestId("own")).toHaveAccessibleName("Own label");
  });

  it("without a Trigger, is named by an aria-label and labelled by nothing else", async () => {
    await render(() => (
      <Menu.Root defaultOpen>
        <Menu.Popup aria-label="Actions" />
      </Menu.Root>
    ));

    expect(popup()).not.toHaveAttribute("aria-labelledby");
    expect(popup()).toHaveAccessibleName("Actions");
  });

  it.skipIf(isJSDOM)(
    "is in the top layer and not modal: a button outside can still be pressed",
    async () => {
      const onClick = vi.fn();
      await render(() => (
        <>
          <Edit defaultOpen />
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
    "is placed below its Trigger, aligned to its start, and moved by side, align and the offsets",
    async () => {
      await render(() => (
        <Edit
          defaultOpen
          trigger={fixedTrigger()}
          popup={{ style: popupStyle }}
        />
      ));
      await frames();

      expect(popup()).toHaveAttribute("data-side", "bottom");
      expect(popup()).toHaveAttribute("data-align", "start");
      let box = popup().getBoundingClientRect();
      expect([box.left, box.top]).toEqual([200, 220]);
    },
  );

  it.skipIf(isJSDOM)(
    "takes side, align, sideOffset and alignOffset",
    async () => {
      await render(() => (
        <Edit
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
      expect([box.left, box.bottom]).toEqual([244, 218]);
    },
  );

  it.skipIf(isJSDOM)(
    "is placed against anchor instead of the Trigger",
    async () => {
      await render(() => (
        <Edit
          defaultOpen
          trigger={fixedTrigger()}
          popup={{
            style: popupStyle,
            anchor: { getBoundingClientRect: () => new DOMRect(50, 60, 0, 0) },
          }}
        />
      ));
      await frames();

      const box = popup().getBoundingClientRect();
      expect([box.left, box.top]).toEqual([50, 60]);
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Escape, reporting escape-key, and returns focus to the Trigger",
    async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => <Edit onOpenChange={onOpenChange} />);
      await user.click(trigger());
      await nextTask();
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "escape-key",
        event: expect.any(KeyboardEvent),
      });
      expect(document.activeElement).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "closes on a press outside, reporting outside-press",
    async () => {
      const onOpenChange = vi.fn();
      await render(() => <Edit defaultOpen onOpenChange={onOpenChange} />);
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
    "closes on Tab, reporting focus-out, and focus moves to the element after the Trigger",
    async () => {
      const onOpenChange = vi.fn();
      const { user } = await render(() => <Edit onOpenChange={onOpenChange} />);
      await user.click(trigger());
      await nextTask();
      expect(document.activeElement).toBe(item("Copy"));

      await keyboard("{Tab}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).toHaveBeenLastCalledWith(false, {
        reason: "focus-out",
        event: expect.any(FocusEvent),
      });
      expect(document.activeElement).toBe(button("After"));
    },
  );

  it.skipIf(isJSDOM)(
    "closes on Shift+Tab, and focus moves to the Trigger",
    async () => {
      const { user } = await render(() => <Edit />);
      await user.click(trigger());
      await nextTask();

      await keyboard("{Shift>}{Tab}{/Shift}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    },
  );

  it.skipIf(isJSDOM)(
    "moves focus to returnFocus once it has closed",
    async () => {
      const { user } = await render(() => (
        <Edit popup={{ returnFocus: () => button("Before") }} />
      ));
      await user.click(trigger());
      await nextTask();

      await keyboard("{Escape}");
      await nextTask();

      expect(document.activeElement).toBe(button("Before"));
    },
  );

  it("throws a descriptive error outside Menu.Root", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Menu.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Menu parts must be placed within <Menu.Root>, and Context Menu parts within <ContextMenu.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
