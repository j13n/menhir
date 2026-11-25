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
import type { ElementProps } from "../../core/renderElement.tsx";
import { PreviewCard } from "../index.ts";
import type { PreviewCardRootProps } from "../root/PreviewCardRoot.tsx";

const popup = () => screen.getByTestId("popup");
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("link", { name: "Ada" });
const button = (name: string) => screen.getByRole("button", { name });
/** A point in Chromium that the tests' elements never cover. */
const away = { x: 380, y: 300 };

type AdaProps = PreviewCardRootProps & { trigger?: JSX.Element };

/** A button before the card, its Trigger at the top left, and the Popup. */
function Ada(props: AdaProps) {
  return (
    <>
      <button type="button">Before</button>
      <PreviewCard.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        delay={props.delay}
        closeDelay={props.closeDelay}
      >
        {props.trigger ?? (
          <PreviewCard.Trigger
            href="#ada"
            style={{ display: "inline-block", width: "60px", height: "30px" }}
          >
            Ada
          </PreviewCard.Trigger>
        )}
        <PreviewCard.Popup data-testid="popup" sideOffset={10}>
          Ada Lovelace, analyst
        </PreviewCard.Popup>
      </PreviewCard.Root>
      <button type="button">After</button>
    </>
  );
}

const reasons = (onOpenChange: ReturnType<typeof vi.fn>) =>
  onOpenChange.mock.calls.map(([open, details]) => [open, details.reason]);

/** Moves focus onto the Trigger with Tab, from the button before it. */
async function tabToTrigger() {
  button("Before").focus();
  await keyboard("{Tab}");
  await afterFlush();
}

describeConformance(
  "<PreviewCard.Trigger />",
  (props) => (
    <PreviewCard.Root>
      <PreviewCard.Trigger href="#conformance" {...props} />
    </PreviewCard.Root>
  ),
  { tagName: "A" },
);

describe("<PreviewCard.Trigger />", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeEach(async () => {
    // Out of the way of the elements a test renders.
    if (!isJSDOM) await movePointer([away]);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    history.replaceState(null, "", location.pathname + location.search);
  });

  it("renders a link with the consumer's href, named by its content, with no type", async () => {
    await render(() => <Ada />);

    expect(trigger().tagName).toBe("A");
    expect(trigger()).toHaveAttribute("href", "#ada");
    expect(trigger()).toHaveAccessibleName("Ada");
    expect(trigger()).not.toHaveAttribute("type");
  });

  it("tells a screen reader nothing of the card", async () => {
    await render(() => <Ada defaultOpen />);

    for (const attribute of [
      "aria-describedby",
      "aria-haspopup",
      "aria-expanded",
      "aria-controls",
    ])
      expect(trigger()).not.toHaveAttribute(attribute);
    expect(trigger()).toHaveAccessibleDescription("");
  });

  it("opens 700 ms after keyboard focus, not before, reporting trigger-focus with the focus", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);

    trigger().focus();
    await wait(699);
    expect(shown()).toBe(false);
    await wait(1);

    expect(shown()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, {
      reason: "trigger-focus",
      event: expect.objectContaining({ type: "focus" }),
    });
  });

  it("opens at once on keyboard focus with delay={0}", async () => {
    await render(() => <Ada delay={0} />);

    trigger().focus();
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it("opens nothing when focus leaves before the delay ends", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);

    trigger().focus();
    await wait(300);
    button("After").focus();
    await wait(1000);

    expect(shown()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("opens nothing when Escape is pressed before the focus delay ends", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    await render(() => <Ada onOpenChange={onOpenChange} />);

    trigger().focus();
    await wait(300);
    fireEvent.keyDown(trigger(), { key: "Escape" });
    await wait(1000);

    expect(shown()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes on a press, reporting trigger-press, and lets the link be followed", async () => {
    const onOpenChange = vi.fn();
    await render(() => <Ada defaultOpen onOpenChange={onOpenChange} />);

    const followed = fireEvent.click(trigger());
    await afterFlush();

    expect(followed).toBe(true);
    expect(shown()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "trigger-press",
      event: expect.objectContaining({ type: "click" }),
    });
  });

  it("opens nothing on hover after a press before the delay ends, until the pointer leaves and comes back", async () => {
    vi.useFakeTimers();
    await render(() => <Ada />);

    enter(trigger());
    fireEvent.click(trigger());
    await wait(1000);
    expect(shown()).toBe(false);

    leave(trigger());
    enter(trigger());
    await wait(700);
    expect(shown()).toBe(true);
  });

  it("calls the consumer's onClick, onFocus and onBlur", async () => {
    const onClick = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    await render(() => (
      <Ada
        trigger={
          <PreviewCard.Trigger
            href="#ada"
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            Ada
          </PreviewCard.Trigger>
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

  it("keeps its behaviour when render renders a component that renders a link", async () => {
    // A router's link component, which takes the props and renders an <a>.
    const RouterLink = (props: ElementProps) => (
      <a {...props} href="#ada" data-router="" />
    );
    await render(() => (
      <Ada
        delay={0}
        trigger={
          <PreviewCard.Trigger render={(p) => <RouterLink {...p} />}>
            Ada
          </PreviewCard.Trigger>
        }
      />
    ));

    trigger().focus();
    await afterFlush();

    expect(trigger()).toHaveAttribute("data-router", "");
    expect(shown()).toBe(true);
  });

  it("throws a descriptive error outside <PreviewCard.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <PreviewCard.Trigger href="#ada">Ada</PreviewCard.Trigger>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] PreviewCard parts must be placed within <PreviewCard.Root>.",
      ),
    ).toBeInTheDocument();
  });

  describe.skipIf(isJSDOM)("with real input", () => {
    it("opens after the delay when Tab moves onto the Trigger, and closes when Tab moves away, reporting trigger-focus", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Ada delay={50} onOpenChange={onOpenChange} />);

      await tabToTrigger();
      expect(document.activeElement).toBe(trigger());
      expect(shown()).toBe(false);
      await vi.waitFor(() => expect(shown()).toBe(true));

      // The card is in the page's order after the Trigger, and holds no
      // tab stop: Tab goes on to the button after.
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("After"));
      expect(shown()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([
        [true, "trigger-focus"],
        [false, "trigger-focus"],
      ]);
    });

    it("does not open when a press focuses the Trigger", async () => {
      await render(() => <Ada delay={0} />);
      // Pressed with the pointer elsewhere so hover opens nothing either.
      trigger().addEventListener("click", (event) => event.preventDefault());

      await press(centerOf(trigger()));
      await movePointer([away]);
      await nextTask();

      expect(document.activeElement).toBe(trigger());
      expect(shown()).toBe(false);
    });

    it("opens nothing on a tap", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Ada delay={0} onOpenChange={onOpenChange} />);
      trigger().addEventListener("click", (event) => event.preventDefault());

      await tap(centerOf(trigger()));
      await nextTask();

      expect(shown()).toBe(false);
      expect(reasons(onOpenChange)).not.toContainEqual([true, "trigger-hover"]);
      expect(reasons(onOpenChange)).not.toContainEqual([true, "trigger-focus"]);
    });

    it("stays open, opened by focus, when the pointer enters and leaves the Trigger, and closes on blur", async () => {
      await render(() => <Ada delay={0} closeDelay={0} />);
      await tabToTrigger();
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
      await render(() => (
        <Ada delay={0} closeDelay={0} onOpenChange={onOpenChange} />
      ));
      await movePointer([centerOf(trigger())]);
      await afterFlush();
      expect(shown()).toBe(true);
      await tabToTrigger();
      expect(reasons(onOpenChange)).toEqual([[true, "trigger-hover"]]);

      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("After"));
      expect(shown()).toBe(true);

      // In steps, as a mouse moves: away from the Popup, out of the safe area.
      await movePointer(line(centerOf(trigger()), away));
      await nextTask();
      expect(shown()).toBe(false);
    });
  });
});
