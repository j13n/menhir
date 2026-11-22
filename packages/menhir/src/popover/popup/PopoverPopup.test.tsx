// The test list and the cases left out are in ../README.md.
import type { JSX } from "@solidjs/web";
import { createSignal, Errored, flush, Show } from "solid-js";
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
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Popover } from "../index.ts";
import type { PopoverRootProps } from "../root/PopoverRoot.tsx";
import type { VirtualElement } from "../../floating/positioning/createPosition.ts";
import type { PopoverPopupProps } from "./PopoverPopup.tsx";

const popup = () => screen.getByRole("dialog", { hidden: true });
const shown = () => popup().matches(":popover-open");
const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

type NotificationsProps = PopoverRootProps &
  Omit<PopoverPopupProps, "children"> & {
    triggerStyle?: JSX.CSSProperties;
    children?: JSX.Element;
  };

/**
 * A 40 by 20 Trigger fixed at (200, 200) by default, a 100 by 50 Popup, and
 * a button after them.
 */
function Notifications(props: NotificationsProps) {
  return (
    <>
      <Popover.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        <Popover.Trigger
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
          Notifications
        </Popover.Trigger>
        <Popover.Popup
          class="popup"
          style={{
            width: "100px",
            height: "50px",
            padding: 0,
            border: 0,
            // Its content stays where a press can reach it.
            overflow: "visible",
          }}
          side={props.side}
          align={props.align}
          sideOffset={props.sideOffset}
          alignOffset={props.alignOffset}
          collisionPadding={props.collisionPadding}
          anchor={props.anchor}
          initialFocus={props.initialFocus}
          returnFocus={props.returnFocus}
          aria-labelledby={props["aria-labelledby"]}
          aria-describedby={props["aria-describedby"]}
        >
          <Popover.Title>Notifications</Popover.Title>
          {props.children}
          <Popover.Close>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <button type="button">After</button>
    </>
  );
}

/** The popup's left and top, as the browser lays it out. */
function placeOf(element: Element) {
  const { left, top } = element.getBoundingClientRect();
  return { left, top };
}

/** Waits for the frames in which observers report and placements land. */
async function frames(count = 3) {
  for (let i = 0; i < count; i++)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

describeConformance(
  "<Popover.Popup />",
  (props) => (
    <Popover.Root>
      <Popover.Popup {...props} />
    </Popover.Root>
  ),
  { tagName: "DIV" },
);

describe("<Popover.Popup />", () => {
  const { render } = createRenderer();
  stubPopover();
  let style: HTMLStyleElement | undefined;
  afterEach(() => {
    vi.restoreAllMocks();
    style?.remove();
    style = undefined;
  });
  const addStyles = (css: string) => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  it("renders a popover with the dialog role and the Root's id, hidden until opened", async () => {
    const { user } = await render(() => <Notifications />);

    expect(popup().tagName).toBe("DIV");
    expect(popup()).toHaveAttribute("popover", "auto");
    expect(popup()).not.toHaveAttribute("aria-modal");
    expect(button("Notifications")).toHaveAttribute(
      "popovertarget",
      popup().id,
    );
    expect(shown()).toBe(false);

    await user.click(button("Notifications"));
    await afterFlush();
    expect(shown()).toBe(true);
  });

  it.skipIf(isJSDOM)(
    "opens in the top layer above an element with a high z-index, and leaves the page usable",
    async () => {
      const onOutside = vi.fn();
      const { user } = await render(() => (
        <>
          <Notifications />
          <div
            style={{
              position: "fixed",
              inset: "0 0 auto 0",
              height: "400px",
              "z-index": "9999",
            }}
          />
          <button
            type="button"
            style={{ position: "fixed", left: "0", top: "500px" }}
            onClick={onOutside}
          >
            Outside
          </button>
        </>
      ));

      // Under the cover, so not by a real press.
      await user.click(button("Notifications"));
      await frames();

      expect(screen.getByRole("dialog")).toBe(popup());
      const { x, y } = centerOf(popup());
      expect(popup().contains(document.elementFromPoint(x, y))).toBe(true);
      button("Outside").focus();
      expect(document.activeElement).toBe(button("Outside"));
      await press(centerOf(button("Outside")));
      expect(onOutside).toHaveBeenCalledOnce();
    },
  );

  describe("naming", () => {
    it("is named by its Title and described by its Description", async () => {
      await render(() => (
        <Notifications defaultOpen>
          <Popover.Description>You are all caught up.</Popover.Description>
        </Notifications>
      ));
      await nextTask();

      expect(popup()).toHaveAccessibleName("Notifications");
      expect(popup()).toHaveAccessibleDescription("You are all caught up.");
      expect(screen.getByText("You are all caught up.").tagName).toBe("P");
    });

    it("names nothing without a Title or a Description, and takes an aria-label", async () => {
      await render(() => (
        <Popover.Root defaultOpen>
          <Popover.Popup aria-label="Settings">Content</Popover.Popup>
        </Popover.Root>
      ));
      await nextTask();

      expect(popup()).not.toHaveAttribute("aria-labelledby");
      expect(popup()).not.toHaveAttribute("aria-describedby");
      expect(popup()).toHaveAccessibleName("Settings");
    });

    it("follows a Title and a Description rendered later, or removed", async () => {
      const [rendered, setRendered] = createSignal(false);
      await render(() => (
        <Popover.Root defaultOpen>
          <Popover.Popup aria-label="Fallback">
            <Show when={rendered()}>
              <Popover.Title>Later title</Popover.Title>
              <Popover.Description>Later description</Popover.Description>
            </Show>
          </Popover.Popup>
        </Popover.Root>
      ));
      await nextTask();
      expect(popup()).not.toHaveAttribute("aria-labelledby");

      setRendered(true);
      flush();
      await nextTask();
      expect(popup()).toHaveAccessibleName("Later title");
      expect(popup()).toHaveAccessibleDescription("Later description");

      setRendered(false);
      flush();
      await nextTask();
      expect(popup()).not.toHaveAttribute("aria-labelledby");
      expect(popup()).not.toHaveAttribute("aria-describedby");
      expect(popup()).toHaveAccessibleName("Fallback");
    });

    it("lets the consumer's aria-labelledby and aria-describedby win", async () => {
      await render(() => (
        <>
          <span id="name">Other name</span>
          <span id="text">Other text</span>
          <Notifications
            defaultOpen
            aria-labelledby="name"
            aria-describedby="text"
          >
            <Popover.Description>You are all caught up.</Popover.Description>
          </Notifications>
        </>
      ));
      await nextTask();

      expect(popup()).toHaveAccessibleName("Other name");
      expect(popup()).toHaveAccessibleDescription("Other text");
    });
  });

  describe.skipIf(isJSDOM)("focus", () => {
    it("leaves focus on the Trigger on opening", async () => {
      await render(() => <Notifications />);

      await press(centerOf(button("Notifications")));
      await nextTask();

      expect(shown()).toBe(true);
      expect(document.activeElement).toBe(button("Notifications"));
    });

    it("moves focus to an element with autofocus on opening", async () => {
      await render(() => (
        <Notifications>
          <input aria-label="Search" autofocus />
        </Notifications>
      ));

      await press(centerOf(button("Notifications")));
      await nextTask();

      expect(document.activeElement).toBe(screen.getByLabelText("Search"));
    });

    it("moves focus to initialFocus on opening", async () => {
      let input: HTMLInputElement | undefined;
      await render(() => (
        <Notifications initialFocus={() => input}>
          <input aria-label="Search" ref={(el) => (input = el)} />
        </Notifications>
      ));

      await press(centerOf(button("Notifications")));
      await nextTask();

      expect(document.activeElement).toBe(screen.getByLabelText("Search"));
    });

    it("lets Tab move from the Trigger into the Popup, then to the element after the Trigger, and Shift+Tab back", async () => {
      await render(() => (
        <Notifications>
          <input aria-label="Search" />
        </Notifications>
      ));
      await press(centerOf(button("Notifications")));
      await nextTask();

      await keyboard("{Tab}");
      expect(document.activeElement).toBe(screen.getByLabelText("Search"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("Close"));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("After"));
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(button("Close"));

      expect(shown()).toBe(true);
    });

    it("stays open when focus leaves it", async () => {
      await render(() => <Notifications />);
      await press(centerOf(button("Notifications")));
      await keyboard("{Tab}");

      await keyboard("{Tab}");
      await nextTask();

      expect(document.activeElement).toBe(button("After"));
      expect(shown()).toBe(true);
    });

    it("moves focus to returnFocus once closed", async () => {
      let other: HTMLButtonElement | undefined;
      await render(() => (
        <>
          <button type="button" ref={(el) => (other = el)}>
            Other
          </button>
          <Notifications returnFocus={() => other} />
        </>
      ));
      await press(centerOf(button("Notifications")));
      await keyboard("{Tab}");

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(document.activeElement).toBe(button("Other"));
    });
  });

  describe.skipIf(isJSDOM)("dismissal", () => {
    it("closes on Escape, reporting escape-key, and returns focus to the Trigger", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Notifications onOpenChange={onOpenChange} />);
      await press(centerOf(button("Notifications")));
      await keyboard("{Tab}");
      expect(document.activeElement).toBe(button("Close"));

      await keyboard("{Escape}");
      await nextTask();

      expect(shown()).toBe(false);
      expect(popup()).toHaveAttribute("data-closed", "");
      expect(document.activeElement).toBe(button("Notifications"));
      const [open, details] = onOpenChange.mock.calls.at(-1)!;
      expect(open).toBe(false);
      expect(details.reason).toBe("escape-key");
      expect(details.event.key).toBe("Escape");
    });

    it("closes on a press outside, reporting outside-press, and not on one inside", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Notifications onOpenChange={onOpenChange} />);
      await press(centerOf(button("Notifications")));
      await nextTask();

      await press(
        centerOf(screen.getByText("Notifications", { selector: "h2" })),
      );
      await nextTask();
      expect(shown()).toBe(true);

      await press({ x: 5, y: 5 });
      await nextTask();
      expect(shown()).toBe(false);
      expect(onOpenChange.mock.calls.at(-1)![1].reason).toBe("outside-press");
    });

    it("is shown again when controlled open after Escape, and reports the close once", async () => {
      const onOpenChange = vi.fn();
      await render(() => <Notifications open onOpenChange={onOpenChange} />);
      await nextTask();

      await keyboard("{Escape}");
      await nextTask();

      expect(onOpenChange).toHaveBeenCalledOnce();
      expect(onOpenChange.mock.calls[0]![1].reason).toBe("escape-key");
      expect(shown()).toBe(true);
    });
  });

  describe.skipIf(isJSDOM)("positioning", () => {
    it.each([
      ["bottom", "center", { left: 170, top: 220 }],
      ["top", "center", { left: 170, top: 150 }],
      ["right", "center", { left: 240, top: 185 }],
      ["left", "center", { left: 100, top: 185 }],
      ["bottom", "start", { left: 200, top: 220 }],
      ["bottom", "end", { left: 140, top: 220 }],
    ] as const)(
      "is placed against the Trigger on side %s, aligned %s",
      async (side, align, place) => {
        await render(() => (
          <Notifications defaultOpen side={side} align={align} />
        ));

        await vi.waitFor(() => expect(placeOf(popup())).toEqual(place));
        expect(popup()).toHaveAttribute("data-side", side);
        expect(popup()).toHaveAttribute("data-align", align);
      },
    );

    it("is placed sideOffset away from the Trigger, and alignOffset along it", async () => {
      await render(() => (
        <Notifications
          defaultOpen
          align="start"
          sideOffset={8}
          alignOffset={4}
        />
      ));

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 204, top: 228 }),
      );
    });

    it("is placed before it is painted when it opens", async () => {
      const painted: string[] = [];
      await render(() => <Notifications />);
      // A frame callback runs before the paint that follows the press.
      button("Notifications").addEventListener("click", () =>
        requestAnimationFrame(() => {
          painted.push(shown() ? popup().style.inset : "hidden");
        }),
      );

      await press(centerOf(button("Notifications")));
      await frames();

      expect(painted).toEqual(["220px auto auto 170px"]);
    });

    describe("at the viewport's edges", () => {
      const width = () => document.documentElement.clientWidth;
      const height = () => document.documentElement.clientHeight;

      it.each([
        ["top", { top: "0px" }, "bottom"],
        ["bottom", { top: "auto", bottom: "0px" }, "top"],
        ["left", { left: "0px" }, "right"],
        ["right", { left: "auto", right: "0px" }, "left"],
      ] as const)(
        "flips from side %s at that edge to the other side",
        async (side, triggerStyle, flipped) => {
          await render(() => (
            <Notifications
              defaultOpen
              side={side}
              triggerStyle={triggerStyle}
            />
          ));

          await vi.waitFor(() =>
            expect(popup()).toHaveAttribute("data-side", flipped),
          );
          const box = popup().getBoundingClientRect();
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.top).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width());
          expect(box.bottom).toBeLessThanOrEqual(height());
        },
      );

      it.each([
        ["left", "bottom", { left: "0px" }, () => ({ left: 5 })],
        [
          "right",
          "bottom",
          { left: "auto", right: "0px" },
          () => ({ left: width() - 5 - 100 }),
        ],
        ["top", "right", { top: "0px" }, () => ({ top: 5 })],
        [
          "bottom",
          "right",
          { top: "auto", bottom: "0px" },
          () => ({ top: height() - 5 - 50 }),
        ],
      ] as const)(
        "shifts along the %s edge, collisionPadding away from it",
        async (_edge, side, triggerStyle, place) => {
          await render(() => (
            <Notifications
              defaultOpen
              side={side}
              triggerStyle={triggerStyle}
            />
          ));

          await vi.waitFor(() =>
            expect(placeOf(popup())).toMatchObject(place()),
          );
          expect(popup()).toHaveAttribute("data-side", side);
        },
      );

      it("keeps collisionPadding from the edge", async () => {
        await render(() => (
          <Notifications
            defaultOpen
            collisionPadding={20}
            triggerStyle={{ left: "0px" }}
          />
        ));

        await vi.waitFor(() =>
          expect(placeOf(popup())).toMatchObject({ left: 20 }),
        );
      });
    });

    it("is placed against anchor: an element through a function, or a virtual element", async () => {
      let field: HTMLDivElement | undefined;
      const [point, setPoint] = createSignal<VirtualElement>();
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
          <Notifications defaultOpen anchor={point() ?? (() => field)} />
        </>
      ));

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 100, top: 330 }),
      );

      setPoint({ getBoundingClientRect: () => new DOMRect(250, 100, 0, 0) });
      flush();

      await vi.waitFor(() =>
        expect(placeOf(popup())).toEqual({ left: 200, top: 100 }),
      );
    });
  });

  it.skipIf(isJSDOM)(
    "stays shown with data-closed while its exit animation runs after Close, then hides",
    async () => {
      // Long enough never to end during the test.
      addStyles(`
        .popup[data-closed] { animation: fade 10s; }
        @keyframes fade { to { opacity: 0; } }
      `);
      await render(() => <Notifications />);
      await press(centerOf(button("Notifications")));
      await nextTask();

      await press(centerOf(button("Close")));
      await nextTask();
      expect(shown()).toBe(true);
      expect(popup()).toHaveAttribute("data-closed", "");

      for (const animation of popup().getAnimations()) animation.finish();
      await nextTask();
      expect(shown()).toBe(false);
    },
  );

  it("keeps its behaviour when render returns a <div>", async () => {
    const { user } = await render(() => (
      <Popover.Root>
        <Popover.Trigger>Notifications</Popover.Trigger>
        <Popover.Popup
          aria-label="Notifications"
          render={(props) => <div data-custom="" {...props} />}
        />
      </Popover.Root>
    ));

    await user.click(button("Notifications"));
    await afterFlush();

    expect(popup()).toHaveAttribute("data-custom", "");
    expect(shown()).toBe(true);
  });

  it("throws a descriptive error outside <Popover.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Popover.Popup />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Popover parts must be placed within <Popover.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
