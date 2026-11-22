// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { createSignal, Errored, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  line,
  movePointer,
  nextTask,
  press,
} from "../../../test/floating/input.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Popover } from "../../popover/index.ts";
import { Tooltip } from "../index.ts";
import type { TooltipRootProps } from "../root/TooltipRoot.tsx";
import type { TooltipPopupProps } from "./TooltipPopup.tsx";

const popup = () => screen.getByRole("tooltip", { hidden: true });
const shown = () => popup().matches(":popover-open");
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
/** A point in Chromium that the tests' elements never cover. */
const away = { x: 380, y: 400 };

type BoldProps = TooltipRootProps &
  Omit<TooltipPopupProps, "children"> & {
    triggerStyle?: JSX.CSSProperties;
  };

/**
 * A button before, a 40 by 20 Trigger fixed at (200, 200) by default, a 100
 * by 30 Popup, and a button after.
 */
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
        <Tooltip.Trigger
          style={{
            position: "fixed",
            left: "200px",
            top: "200px",
            width: "40px",
            height: "20px",
            margin: 0,
            padding: 0,
            border: 0,
            ...props.triggerStyle,
          }}
        >
          Bold
        </Tooltip.Trigger>
        <Tooltip.Popup
          class="popup"
          style={{ width: "100px", height: "30px", padding: 0, border: 0 }}
          side={props.side}
          align={props.align}
          sideOffset={props.sideOffset}
          alignOffset={props.alignOffset}
          collisionPadding={props.collisionPadding}
          anchor={props.anchor}
        >
          Ctrl+B
        </Tooltip.Popup>
      </Tooltip.Root>
      <button type="button">After</button>
    </>
  );
}

/** The popup's left and top, as the browser lays it out. */
function placeOf(element: Element) {
  const { left, top } = element.getBoundingClientRect();
  return { left, top };
}

/** Moves focus onto the Trigger with Tab, from the button before it. */
async function tabToTrigger() {
  button("Before").focus();
  await keyboard("{Tab}");
  await afterFlush();
}

describeConformance(
  "<Tooltip.Popup />",
  (props) => (
    <Tooltip.Root>
      <Tooltip.Popup {...props} />
    </Tooltip.Root>
  ),
  { tagName: "DIV" },
);

describe("<Tooltip.Popup />", () => {
  const { render } = createRenderer();
  stubPopover();
  let style: HTMLStyleElement | undefined;
  beforeEach(async () => {
    if (!isJSDOM) await movePointer([away]);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    style?.remove();
    style = undefined;
  });
  const addStyles = (css: string) => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  it("renders a manual popover with the tooltip role and the Root's id, hidden until opened", async () => {
    await render(() => <Bold />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "manual");
    expect(button("Bold")).toHaveAttribute("aria-describedby", popup().id);
    expect(shown()).toBe(false);

    button("Bold").focus();
    await afterFlush();

    expect(shown()).toBe(true);
    expect(screen.getByRole("tooltip")).toBe(popup());
  });

  it.skipIf(isJSDOM)(
    "opens in the top layer, above an element with a high z-index",
    async () => {
      await render(() => (
        <>
          <Bold defaultOpen />
          <div
            style={{
              position: "fixed",
              inset: "0 0 auto 0",
              height: "400px",
              "z-index": "9999",
            }}
          />
        </>
      ));
      await nextTask();

      const { x, y } = centerOf(popup());
      expect(popup().contains(document.elementFromPoint(x, y))).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "never takes focus: opening leaves it on the Trigger, and Tab goes on to the element after",
    async () => {
      await render(() => <Bold />);

      await tabToTrigger();
      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(button("Bold"));

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("After"));
    },
  );

  it.skipIf(isJSDOM)(
    "stays open while the pointer moves from the Trigger across the gap onto it, and closes once it leaves both",
    async () => {
      await render(() => <Bold delay={0} sideOffset={10} />);
      await movePointer([centerOf(button("Bold"))]);
      await afterFlush();
      expect(shown()).toBe(true);
      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 170, top: 160 }),
      );

      await movePointer(line(centerOf(button("Bold")), centerOf(popup())));
      await nextTask();
      expect(shown()).toBe(true);

      await movePointer(line(centerOf(popup()), away));
      await nextTask();
      expect(shown()).toBe(false);
    },
  );

  describe.skipIf(isJSDOM)("positioning", () => {
    it.each([
      [undefined, "center", { left: 170, top: 170 }],
      ["bottom", "center", { left: 170, top: 220 }],
      ["right", "center", { left: 240, top: 195 }],
      ["left", "center", { left: 100, top: 195 }],
      ["top", "start", { left: 200, top: 170 }],
    ] as const)(
      "is placed against the Trigger on side %s (top by default), aligned %s",
      async (side, align, place) => {
        await render(() => <Bold defaultOpen side={side} align={align} />);

        await vi.waitFor(() => expect(placeOf(popup())).toEqual(place));
        expect(popup()).toHaveAttribute("data-side", side ?? "top");
        expect(popup()).toHaveAttribute("data-align", align);
      },
    );

    it("is placed sideOffset away from the Trigger", async () => {
      await render(() => <Bold defaultOpen sideOffset={8} />);

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 170, top: 162 }),
      );
    });

    it("flips below a Trigger at the top edge of the viewport", async () => {
      await render(() => <Bold defaultOpen triggerStyle={{ top: "0px" }} />);

      await vi.waitFor(() =>
        expect(popup()).toHaveAttribute("data-side", "bottom"),
      );
      expect(placeOf(popup()).top).toBe(20);
    });

    it("is placed against anchor", async () => {
      let field: HTMLDivElement | undefined;
      await render(() => (
        <>
          <div
            ref={(el) => (field = el)}
            style={{
              position: "fixed",
              left: "50px",
              top: "300px",
              width: "200px",
              height: "30px",
            }}
          />
          <Bold defaultOpen anchor={() => field} />
        </>
      ));

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 100, top: 270 }),
      );
    });
  });

  it.skipIf(isJSDOM)(
    "stays open when a Popover opens, and leaves an open Popover open when it opens",
    async () => {
      const [open, setOpen] = createSignal(true);
      await render(() => (
        <>
          <Bold open={open()} />
          <Popover.Root>
            <Popover.Trigger
              style={{ position: "fixed", left: "0px", top: "400px" }}
            >
              Notifications
            </Popover.Trigger>
            <Popover.Popup aria-label="Notifications">
              Nothing new
            </Popover.Popup>
          </Popover.Root>
        </>
      ));
      const popover = () => screen.getByRole("dialog", { hidden: true });

      await press(centerOf(button("Notifications")));
      await nextTask();
      expect(popover().matches(":popover-open")).toBe(true);
      expect(shown()).toBe(true);

      setOpen(false);
      flush();
      expect(shown()).toBe(false);
      setOpen(true);
      flush();
      await nextTask();
      expect(shown()).toBe(true);
      expect(popover().matches(":popover-open")).toBe(true);
    },
  );

  it.skipIf(isJSDOM)(
    "stays shown with data-closed while its exit animation runs after Escape, then hides",
    async () => {
      // Long enough never to end during the test.
      addStyles(`
        .popup[data-closed] { animation: fade 10s; }
        @keyframes fade { to { opacity: 0; } }
      `);
      await render(() => <Bold />);
      await tabToTrigger();
      expect(shown()).toBe(true);

      await keyboard("{Escape}");
      await nextTask();
      expect(shown()).toBe(true);
      expect(popup()).toHaveAttribute("data-closed", "");

      for (const animation of popup().getAnimations()) animation.finish();
      await nextTask();
      expect(shown()).toBe(false);
    },
  );

  it("keeps its behaviour when render returns a <div>", async () => {
    await render(() => (
      <Tooltip.Root>
        <Tooltip.Trigger>Bold</Tooltip.Trigger>
        <Tooltip.Popup render={(props) => <div data-custom="" {...props} />}>
          Ctrl+B
        </Tooltip.Popup>
      </Tooltip.Root>
    ));

    button("Bold").focus();
    await afterFlush();

    expect(popup()).toHaveAttribute("data-custom", "");
    expect(button("Bold")).toHaveAttribute("aria-describedby", popup().id);
    expect(shown()).toBe(true);
  });

  it("throws a descriptive error outside <Tooltip.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Tooltip.Popup>Ctrl+B</Tooltip.Popup>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Tooltip parts must be placed within <Tooltip.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
