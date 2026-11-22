// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { Errored } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { enter, leave, wait } from "../../../test/floating/hover/helpers.ts";
import {
  centerOf,
  keyboard,
  line,
  movePointer,
  nextTask,
  press,
  tap,
} from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Tooltip } from "../index.ts";
import type { TooltipRootProps } from "../root/TooltipRoot.tsx";

const popup = () => screen.getByRole("tooltip", { hidden: true });
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("button", { name: "Bold" });
/** A point in Chromium that the tests' elements never cover. */
const away = { x: 380, y: 300 };

type BoldProps = TooltipRootProps & { trigger?: JSX.Element };

/** A button before the tooltip, its Trigger at the top left, and the Popup. */
function Bold(props: BoldProps) {
  return (
    <>
      <button type="button">Before</button>
      <Tooltip.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        delay={props.delay}
      >
        {props.trigger ?? (
          <Tooltip.Trigger style={{ width: "60px", height: "30px" }}>
            Bold
          </Tooltip.Trigger>
        )}
        <Tooltip.Popup sideOffset={10}>Ctrl+B</Tooltip.Popup>
      </Tooltip.Root>
      <button type="button">After</button>
    </>
  );
}

const reasons = (onOpenChange: ReturnType<typeof vi.fn>) =>
  onOpenChange.mock.calls.map(([open, details]) => [open, details.reason]);

describeConformance(
  "<Tooltip.Trigger />",
  (props) => (
    <Tooltip.Root>
      <Tooltip.Trigger {...props} />
    </Tooltip.Root>
  ),
  { tagName: "BUTTON" },
);

describe("<Tooltip.Trigger />", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeEach(async () => {
    // Out of the way of the elements a test renders.
    if (!isJSDOM) await movePointer([away]);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a button of type button, named by its content, taking the consumer's id", async () => {
    await render(() => (
      <Bold trigger={<Tooltip.Trigger id="bold">Bold</Tooltip.Trigger>} />
    ));

    expect(trigger().tagName).toBe("BUTTON");
    expect(trigger()).toHaveAttribute("type", "button");
    expect(trigger()).toHaveAccessibleName("Bold");
    expect(trigger()).toHaveAttribute("id", "bold");
  });

  it("names the Popup in aria-describedby, and is described by it closed and open", async () => {
    await render(() => <Bold />);

    expect(popup().id).not.toBe("");
    expect(trigger()).toHaveAttribute("aria-describedby", popup().id);
    expect(trigger()).toHaveAccessibleDescription("Ctrl+B");

    trigger().focus();
    await afterFlush();

    expect(shown()).toBe(true);
    expect(trigger()).toHaveAccessibleDescription("Ctrl+B");
  });

  it("lets the consumer's aria-describedby win, and false remove it", async () => {
    await render(() => (
      <>
        <p id="hint">Makes text bold</p>
        <Tooltip.Root>
          <Tooltip.Trigger aria-describedby="hint">Bold</Tooltip.Trigger>
          <Tooltip.Popup>Ctrl+B</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger aria-describedby={false as unknown as string}>
            Italic
          </Tooltip.Trigger>
          <Tooltip.Popup>Italic</Tooltip.Popup>
        </Tooltip.Root>
      </>
    ));

    expect(trigger()).toHaveAttribute("aria-describedby", "hint");
    expect(screen.getByRole("button", { name: "Italic" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("opens at once on keyboard focus, reporting trigger-focus", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Bold onOpenChange={onOpenChange} />);

    trigger().focus();
    await afterFlush();

    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, {
      reason: "trigger-focus",
      event: expect.objectContaining({ type: "focus" }),
    });
  });

  it("opens nothing on hover after a press before the delay ends, until the pointer leaves and comes back", async () => {
    vi.useFakeTimers();
    await render(() => <Bold />);

    enter(trigger());
    fireEvent.click(trigger());
    await wait(1000);
    expect(shown()).toBe(false);

    leave(trigger());
    enter(trigger());
    await wait(600);
    expect(shown()).toBe(true);
  });

  it("opens on hover after a press by keyboard, with the pointer elsewhere", async () => {
    vi.useFakeTimers();
    await render(() => <Bold />);

    // Enter or Space clicks the button with no pointer on it.
    fireEvent.click(trigger());
    enter(trigger());
    await wait(600);

    expect(shown()).toBe(true);
  });

  it("opens nothing on hover when disabled; with aria-disabled it opens on hover and on focus", async () => {
    vi.useFakeTimers();
    await render(() => (
      <>
        <Tooltip.Root>
          <Tooltip.Trigger render={(p) => <button {...p} disabled />}>
            Bold
          </Tooltip.Trigger>
          <Tooltip.Popup data-testid="disabled">Unavailable</Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger aria-disabled="true">Italic</Tooltip.Trigger>
          <Tooltip.Popup data-testid="aria-disabled">Unavailable</Tooltip.Popup>
        </Tooltip.Root>
      </>
    ));
    const italic = screen.getByRole("button", { name: "Italic" });

    enter(trigger());
    await wait(600);
    expect(screen.getByTestId("disabled").matches(":popover-open")).toBe(false);

    enter(italic);
    await wait(600);
    const ariaDisabled = screen.getByTestId("aria-disabled");
    expect(ariaDisabled.matches(":popover-open")).toBe(true);
    leave(italic);
    await afterFlush();
    expect(ariaDisabled.matches(":popover-open")).toBe(false);

    italic.focus();
    await afterFlush();
    expect(ariaDisabled.matches(":popover-open")).toBe(true);
  });

  it("calls the consumer's onClick, onFocus and onBlur", async () => {
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    await render(() => (
      <Bold
        trigger={
          <Tooltip.Trigger onClick={onClick} onFocus={onFocus} onBlur={onBlur}>
            Bold
          </Tooltip.Trigger>
        }
      />
    ));

    trigger().focus();
    fireEvent.click(trigger());
    trigger().blur();

    expect(onFocus).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("does not submit its form", async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { user } = await render(() => (
      <form onSubmit={onSubmit}>
        <Bold />
      </form>
    ));

    await user.click(trigger());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps its behaviour when render renders a link", async () => {
    await render(() => (
      <Bold
        trigger={
          <Tooltip.Trigger render={(p) => <a {...p} href="#bold" />}>
            Bold
          </Tooltip.Trigger>
        }
      />
    ));
    const link = screen.getByRole("link", { name: "Bold" });

    link.focus();
    await afterFlush();

    expect(link).toHaveAttribute("aria-describedby", popup().id);
    expect(shown()).toBe(true);
  });

  it("throws a descriptive error outside <Tooltip.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tooltip.Trigger>Bold</Tooltip.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tooltip parts must be placed within <Tooltip.Root>.",
      ),
    ).toBeInTheDocument();
  });

  describe.skipIf(isJSDOM)("with real input", () => {
    it("opens when Tab moves onto the Trigger, and closes when Tab moves away, reporting trigger-focus", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Bold onOpenChange={onOpenChange} />);

      screen.getByRole("button", { name: "Before" }).focus();
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(trigger());
      expect(shown()).toBe(true);

      await keyboard("{Tab}");
      await afterFlush();
      expect(shown()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([
        [true, "trigger-focus"],
        [false, "trigger-focus"],
      ]);
    });

    it("does not open when a press focuses the Trigger", async () => {
      await render(() => <Bold />);

      await press(centerOf(trigger()));
      await nextTask();

      expect(document.activeElement).toBe(trigger());
      expect(shown()).toBe(false);
    });

    it("closes on a press, reporting trigger-press, and stays closed while the pointer stays", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Bold delay={0} onOpenChange={onOpenChange} />);
      await movePointer([centerOf(trigger())]);
      await afterFlush();
      expect(shown()).toBe(true);

      await press(centerOf(trigger()));
      await nextTask();
      expect(shown()).toBe(false);
      await movePointer([{ x: 20, y: 20 }]);
      await nextTask();

      expect(shown()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([
        [true, "trigger-hover"],
        [false, "trigger-press"],
      ]);
    });

    it.each(["{Enter}", " "])(
      "closes on %j when opened by focus, and stays closed while focused",
      async (key) => {
        const onOpenChange = vi.fn();
        await render(() => <Bold onOpenChange={onOpenChange} />);
        screen.getByRole("button", { name: "Before" }).focus();
        await keyboard("{Tab}");
        await afterFlush();
        expect(shown()).toBe(true);

        await keyboard(key);
        await nextTask();

        expect(shown()).toBe(false);
        expect(document.activeElement).toBe(trigger());
        expect(reasons(onOpenChange)).toEqual([
          [true, "trigger-focus"],
          [false, "trigger-press"],
        ]);
      },
    );

    it("opens nothing on a tap", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Bold delay={0} onOpenChange={onOpenChange} />);

      await tap(centerOf(trigger()));
      await nextTask();

      expect(shown()).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("opens nothing when disabled, with a real pointer resting on it", async () => {
      vi.useFakeTimers();
      await render(() => (
        <Bold
          trigger={
            <Tooltip.Trigger render={(p) => <button {...p} disabled />}>
              Bold
            </Tooltip.Trigger>
          }
        />
      ));

      await movePointer([centerOf(trigger())]);
      await wait(1000);

      expect(shown()).toBe(false);
    });

    it("stays open, opened by focus, when the pointer enters and leaves the Trigger, and closes on blur", async () => {
      await render(() => <Bold delay={0} />);
      screen.getByRole("button", { name: "Before" }).focus();
      await keyboard("{Tab}");
      await afterFlush();
      expect(shown()).toBe(true);

      await movePointer([centerOf(trigger())]);
      await movePointer(line(centerOf(trigger()), away));
      await nextTask();
      expect(shown()).toBe(true);

      await keyboard("{Tab}");
      await afterFlush();
      expect(shown()).toBe(false);
    });

    it("stays open, opened by hover, when the Trigger loses focus while the pointer rests on it, and closes when it leaves", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Bold delay={0} onOpenChange={onOpenChange} />);
      await movePointer([centerOf(trigger())]);
      await afterFlush();
      expect(shown()).toBe(true);
      // Focus arrives once it is open, and leaves while the pointer rests.
      screen.getByRole("button", { name: "Before" }).focus();
      await keyboard("{Tab}");
      await afterFlush();
      expect(reasons(onOpenChange)).toEqual([[true, "trigger-hover"]]);

      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "After" }),
      );
      expect(shown()).toBe(true);

      // In steps, as a mouse moves: out of the safe area towards the Popup.
      await movePointer(line(centerOf(trigger()), away));
      await nextTask();
      expect(shown()).toBe(false);
    });
  });
});
