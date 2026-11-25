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
import { PreviewCard } from "../index.ts";
import type { PreviewCardRootProps } from "../root/PreviewCardRoot.tsx";
import type { PreviewCardPopupProps } from "./PreviewCardPopup.tsx";

const popup = () => screen.getByTestId("popup");
const shown = () => popup().matches(":popover-open");
const trigger = () => screen.getByRole("link", { name: "Ada" });
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
/** A point in Chromium that the tests' elements never cover. */
const away = { x: 380, y: 400 };

type AdaProps = PreviewCardRootProps &
  Omit<PreviewCardPopupProps, "children"> & {
    triggerStyle?: JSX.CSSProperties;
  };

const reasons = (onOpenChange: ReturnType<typeof vi.fn>) =>
  onOpenChange.mock.calls.map(([open, details]) => [open, details.reason]);

/**
 * A button before, a 40 by 20 Trigger fixed at (200, 200) by default, a 100
 * by 30 Popup holding a button, and a button after.
 */
function Ada(props: AdaProps) {
  return (
    <>
      <button type="button">Before</button>
      <PreviewCard.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        delay={props.delay ?? 0}
        closeDelay={props.closeDelay ?? 0}
      >
        <PreviewCard.Trigger
          href="#ada"
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
          Ada
        </PreviewCard.Trigger>
        <PreviewCard.Popup
          data-testid="popup"
          class="popup"
          style={{ width: "100px", height: "30px", padding: 0, border: 0 }}
          side={props.side}
          align={props.align}
          sideOffset={props.sideOffset}
          alignOffset={props.alignOffset}
          collisionPadding={props.collisionPadding}
          anchor={props.anchor}
        >
          <button type="button" style={{ margin: 0 }}>
            Follow
          </button>
        </PreviewCard.Popup>
      </PreviewCard.Root>
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
  "<PreviewCard.Popup />",
  (props) => (
    <PreviewCard.Root>
      <PreviewCard.Popup {...props} />
    </PreviewCard.Root>
  ),
  { tagName: "DIV" },
);

describe("<PreviewCard.Popup />", () => {
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
    history.replaceState(null, "", location.pathname + location.search);
  });
  const addStyles = (css: string) => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  it("renders a manual popover with no role, hidden until opened", async () => {
    await render(() => <Ada />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "manual");
    expect(popup()).not.toHaveAttribute("role");
    expect(shown()).toBe(false);

    trigger().focus();
    await afterFlush();

    expect(shown()).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens in the top layer, above an element with a high z-index",
    async () => {
      await render(() => (
        <>
          <Ada defaultOpen />
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

  describe.skipIf(isJSDOM)("focus", () => {
    it("is left on the Trigger when it opens", async () => {
      await render(() => <Ada />);

      await tabToTrigger();

      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(trigger());
    });

    it("moves into the open card on Tab, which keeps it open; out of it to an element outside closes it, reporting focus-out", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Ada onOpenChange={onOpenChange} />);
      await tabToTrigger();

      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("Follow"));
      expect(shown()).toBe(true);

      await keyboard("{Shift>}{Tab}{/Shift}");
      await afterFlush();
      expect(document.activeElement).toBe(trigger());
      expect(shown()).toBe(true);

      await keyboard("{Tab}");
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("After"));
      expect(shown()).toBe(false);
      expect(reasons(onOpenChange)).toEqual([
        [true, "trigger-focus"],
        [false, "focus-out"],
      ]);
    });

    it("returns to the Trigger when Escape closes the card with focus inside", async () => {
      await render(() => <Ada />);
      await tabToTrigger();
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("Follow"));

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });

    it("keeps a card opened by focus open while the pointer moves onto it and away, until focus leaves", async () => {
      await render(() => <Ada sideOffset={10} />);
      await tabToTrigger();
      await keyboard("{Tab}");
      await afterFlush();
      expect(document.activeElement).toBe(button("Follow"));

      await movePointer(line(away, centerOf(popup())));
      await movePointer(line(centerOf(popup()), away));
      await nextTask();
      expect(shown()).toBe(true);

      await keyboard("{Tab}");
      await afterFlush();
      expect(shown()).toBe(false);
    });
  });

  it.skipIf(isJSDOM)(
    "stays open while the pointer moves from the Trigger across the gap onto it, and closes once it leaves both",
    async () => {
      await render(() => <Ada sideOffset={10} />);
      await movePointer([centerOf(trigger())]);
      await afterFlush();
      expect(shown()).toBe(true);
      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 170, top: 230 }),
      );

      await movePointer(line(centerOf(trigger()), centerOf(popup())));
      await nextTask();
      expect(shown()).toBe(true);

      await movePointer(line(centerOf(popup()), away));
      await nextTask();
      expect(shown()).toBe(false);
    },
  );

  it.skipIf(isJSDOM)(
    "takes a press on a button inside, stays open until the pointer leaves, then returns focus to the Trigger",
    async () => {
      const onClick = vi.fn();
      await render(() => <Ada sideOffset={10} />);
      button("Follow").addEventListener("click", onClick);
      await movePointer([centerOf(trigger())]);
      await afterFlush();
      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 170, top: 230 }),
      );
      await movePointer(line(centerOf(trigger()), centerOf(button("Follow"))));

      await press(centerOf(button("Follow")));
      await nextTask();
      expect(onClick).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(button("Follow"));
      expect(shown()).toBe(true);

      // Focus inside goes back to the link as the card closes, not to the
      // <body>, and opens nothing there.
      await movePointer(line(centerOf(popup()), away));
      await nextTask();
      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    },
  );

  describe.skipIf(isJSDOM)("positioning", () => {
    it.each([
      [undefined, "center", { left: 170, top: 220 }],
      ["top", "center", { left: 170, top: 170 }],
      ["right", "center", { left: 240, top: 195 }],
      ["left", "center", { left: 100, top: 195 }],
      ["bottom", "start", { left: 200, top: 220 }],
    ] as const)(
      "is placed against the Trigger on side %s (bottom by default), aligned %s",
      async (side, align, place) => {
        await render(() => <Ada defaultOpen side={side} align={align} />);

        await vi.waitFor(() => expect(placeOf(popup())).toEqual(place));
        expect(popup()).toHaveAttribute("data-side", side ?? "bottom");
        expect(popup()).toHaveAttribute("data-align", align);
      },
    );

    it("is placed sideOffset away from the Trigger", async () => {
      await render(() => <Ada defaultOpen sideOffset={8} />);

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 170, top: 228 }),
      );
    });

    it("flips above a Trigger at the bottom edge of the viewport", async () => {
      await render(() => (
        <Ada defaultOpen triggerStyle={{ top: "auto", bottom: "0px" }} />
      ));

      await vi.waitFor(() =>
        expect(popup()).toHaveAttribute("data-side", "top"),
      );
      expect(placeOf(popup()).top).toBe(window.innerHeight - 20 - 30);
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
          <Ada defaultOpen anchor={() => field} />
        </>
      ));

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 100, top: 330 }),
      );
    });
  });

  it.skipIf(isJSDOM)(
    "stays open when a Popover opens, and leaves an open Popover open when it opens",
    async () => {
      const [open, setOpen] = createSignal(true);
      await render(() => (
        <>
          <Ada open={open()} />
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
      await render(() => <Ada />);
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

  it("keeps its behaviour when render returns a <span>", async () => {
    await render(() => (
      <PreviewCard.Root delay={0}>
        <PreviewCard.Trigger href="#ada">Ada</PreviewCard.Trigger>
        <PreviewCard.Popup
          render={(props) => <span data-testid="popup" {...props} />}
        >
          Ada Lovelace
        </PreviewCard.Popup>
      </PreviewCard.Root>
    ));

    trigger().focus();
    await afterFlush();

    expect(popup().tagName).toBe("SPAN");
    expect(popup()).toHaveAttribute("popover", "manual");
    expect(shown()).toBe(true);
  });

  it("throws a descriptive error outside <PreviewCard.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <PreviewCard.Popup>Ada Lovelace</PreviewCard.Popup>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] PreviewCard parts must be placed within <PreviewCard.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
