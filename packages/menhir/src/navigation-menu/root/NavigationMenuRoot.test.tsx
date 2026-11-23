// The test list and the cases left out are in ../README.md.
import { createMemo, createSignal, flush, Loading } from "solid-js";
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
import {
  away,
  changes,
  isOpen,
  link,
  panel,
  Site,
  trigger,
} from "../../../test/navigation-menu/Site.tsx";
import { NavigationMenu } from "../index.ts";

describeConformance(
  "<NavigationMenu.Root />",
  (props) => <NavigationMenu.Root {...props} />,
  { tagName: "NAV" },
);

describe("<NavigationMenu.Root />", () => {
  const { render } = createRenderer();
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a navigation landmark, named by its aria-label", async () => {
    await render(() => <Site />);

    expect(screen.getByRole("navigation", { name: "Main" }).tagName).toBe(
      "NAV",
    );
  });

  it("closes every Panel by default, and opens the defaultValue's", async () => {
    await render(() => (
      <>
        <Site />
        <NavigationMenu.Root defaultValue="open">
          <NavigationMenu.Item value="open">
            <NavigationMenu.Trigger>Open</NavigationMenu.Trigger>
            <NavigationMenu.Panel>Shown</NavigationMenu.Panel>
          </NavigationMenu.Item>
        </NavigationMenu.Root>
      </>
    ));

    expect(isOpen("Products")).toBe(false);
    expect(isOpen("Docs")).toBe(false);
    expect(isOpen("Open")).toBe(true);
  });

  it("opens a Panel on a press, closes the other in one change, and closes it again", async () => {
    const onValueChange = vi.fn();
    await render(() => <Site onValueChange={onValueChange} />);

    fireEvent.click(trigger("Products"));
    await afterFlush();
    expect(isOpen("Products")).toBe(true);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("products", {
      reason: "trigger-press",
      event: expect.objectContaining({ type: "click" }),
    });

    fireEvent.click(trigger("Docs"));
    await afterFlush();
    expect(isOpen("Docs")).toBe(true);
    expect(isOpen("Products")).toBe(false);

    fireEvent.click(trigger("Docs"));
    await afterFlush();
    expect(isOpen("Docs")).toBe(false);
    expect(changes(onValueChange)).toEqual([
      ["products", "trigger-press"],
      ["docs", "trigger-press"],
      [null, "trigger-press"],
    ]);
  });

  it("stays put when controlled, and asks with the requested value", async () => {
    const onValueChange = vi.fn();
    await render(() => <Site value="products" onValueChange={onValueChange} />);

    fireEvent.click(trigger("Docs"));
    await afterFlush();

    expect(changes(onValueChange)).toEqual([["docs", "trigger-press"]]);
    expect(isOpen("Products")).toBe(true);
    expect(isOpen("Docs")).toBe(false);
  });

  it("follows a controlled value changed from outside, and null closes every Panel", async () => {
    const [value, setValue] = createSignal<string | null>(null);
    await render(() => <Site value={value()} />);
    expect(isOpen("Products")).toBe(false);

    setValue("docs");
    flush();
    expect(isOpen("Docs")).toBe(true);

    setValue(null);
    flush();
    expect(isOpen("Docs")).toBe(false);
  });

  it("opens before async work that onValueChange starts settles", async () => {
    const [value, setValue] = createSignal<string | null>(null);
    let resolveDetails!: (details: string) => void;
    await render(() => {
      const details = createMemo(() =>
        value()
          ? new Promise<string>((resolve) => (resolveDetails = resolve))
          : "none",
      );
      return (
        <Loading fallback="loading">
          <Site onValueChange={(next) => setValue(next)} />
          <output>{details()}</output>
        </Loading>
      );
    });

    fireEvent.click(trigger("Products"));
    await afterFlush();

    expect(screen.getByRole("status")).toHaveTextContent("none");
    expect(isOpen("Products")).toBe(true);

    resolveDetails("loaded");
    await new Promise((resolve) => setTimeout(resolve));
    flush();
    expect(screen.getByRole("status")).toHaveTextContent("loaded");
  });

  it("renders through a render function, keeping its behaviour", async () => {
    await render(() => (
      <NavigationMenu.Root
        aria-label="Footer"
        render={(props) => <div role="navigation" {...props} />}
      >
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>More</NavigationMenu.Trigger>
          <NavigationMenu.Panel>Links</NavigationMenu.Panel>
        </NavigationMenu.Item>
      </NavigationMenu.Root>
    ));

    expect(screen.getByRole("navigation", { name: "Footer" }).tagName).toBe(
      "DIV",
    );
    fireEvent.click(trigger("More"));
    await afterFlush();
    expect(isOpen("More")).toBe(true);
  });

  describe("hover", () => {
    beforeEach(() => vi.useFakeTimers());

    it("opens after 300 ms of a mouse resting on a Trigger, reporting trigger-hover", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);

      enter(trigger("Products"));
      await wait(299);
      expect(isOpen("Products")).toBe(false);
      await wait(1);

      expect(isOpen("Products")).toBe(true);
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("products", {
        reason: "trigger-hover",
        event: expect.objectContaining({ type: "pointerenter" }),
      });
    });

    it("takes delay", async () => {
      await render(() => <Site delay={50} />);

      enter(trigger("Products"));
      await wait(50);

      expect(isOpen("Products")).toBe(true);
    });

    it("closes 200 ms after the pointer has left, reporting trigger-hover, and stays open if it comes back", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);
      enter(trigger("Products"));
      await wait(300);
      onValueChange.mockClear();

      leave(trigger("Products"));
      await wait(150);
      expect(isOpen("Products")).toBe(true);
      enter(trigger("Products"));
      await wait(100);
      expect(isOpen("Products")).toBe(true);

      leave(trigger("Products"));
      await wait(199);
      expect(isOpen("Products")).toBe(true);
      await wait(1);
      expect(isOpen("Products")).toBe(false);
      expect(changes(onValueChange)).toEqual([[null, "trigger-hover"]]);
    });

    it("takes closeDelay", async () => {
      await render(() => <Site closeDelay={0} />);
      enter(trigger("Products"));
      await wait(300);

      leave(trigger("Products"));
      await afterFlush();

      expect(isOpen("Products")).toBe(false);
    });

    it("opens the next at once while one is open, closing the first in one change", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);
      enter(trigger("Products"));
      await wait(300);
      onValueChange.mockClear();

      // Straight from one Trigger onto the next, as along the bar.
      fireEvent.pointerLeave(trigger("Products"), {
        pointerType: "mouse",
        clientX: 100,
        clientY: 10,
        relatedTarget: trigger("Docs"),
      });
      enter(trigger("Docs"));
      await afterFlush();

      expect(isOpen("Docs")).toBe(true);
      expect(isOpen("Products")).toBe(false);
      // The Products close that hover had scheduled is cancelled.
      await wait(500);
      expect(isOpen("Docs")).toBe(true);
      expect(changes(onValueChange)).toEqual([["docs", "trigger-hover"]]);
    });

    it("keeps the next open when the first closes in the same turn", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site closeDelay={0} onValueChange={onValueChange} />);
      enter(trigger("Products"));
      await wait(300);
      onValueChange.mockClear();

      fireEvent.pointerLeave(trigger("Products"), {
        pointerType: "mouse",
        clientX: 100,
        clientY: 10,
        relatedTarget: trigger("Docs"),
      });
      enter(trigger("Docs"));
      // A move out of the safe area to the Products Panel before the Docs
      // opening has landed: the Products close must not undo it.
      fireEvent.pointerMove(document.body, {
        pointerType: "mouse",
        clientX: 500,
        clientY: 600,
      });
      await afterFlush();

      expect(isOpen("Docs")).toBe(true);
      expect(isOpen("Products")).toBe(false);
      expect(changes(onValueChange)).toEqual([["docs", "trigger-hover"]]);
    });

    it("opens the next at once while one opened by a press is open", async () => {
      await render(() => <Site />);
      fireEvent.click(trigger("Products"));
      await afterFlush();

      enter(trigger("Docs"));
      await afterFlush();

      expect(isOpen("Docs")).toBe(true);
      expect(isOpen("Products")).toBe(false);
    });

    it("opens the next at once within timeout of the last close, and after it waits its delay", async () => {
      await render(() => <Site />);
      enter(trigger("Products"));
      await wait(300);
      leave(trigger("Products"));
      await wait(200);
      expect(isOpen("Products")).toBe(false);

      await wait(399);
      enter(trigger("Docs"));
      await afterFlush();
      expect(isOpen("Docs")).toBe(true);

      leave(trigger("Docs"));
      await wait(200);
      await wait(400);
      enter(trigger("Products"));
      await wait(299);
      expect(isOpen("Products")).toBe(false);
      await wait(1);
      expect(isOpen("Products")).toBe(true);
    });

    it("takes timeout", async () => {
      await render(() => <Site timeout={1000} closeDelay={0} />);
      enter(trigger("Products"));
      await wait(300);
      leave(trigger("Products"));
      await wait(900);

      enter(trigger("Docs"));
      await afterFlush();

      expect(isOpen("Docs")).toBe(true);
    });

    it("keeps a Panel opened by a press open when the pointer leaves", async () => {
      await render(() => <Site />);
      enter(trigger("Products"));
      fireEvent.click(trigger("Products"));
      await afterFlush();

      leave(trigger("Products"));
      await wait(1000);

      expect(isOpen("Products")).toBe(true);
    });

    it("closes a Panel that hover opened on a press, and opens it again only once the pointer comes back", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);
      enter(trigger("Products"));
      await wait(300);

      fireEvent.click(trigger("Products"));
      await wait(1000);
      expect(isOpen("Products")).toBe(false);

      leave(trigger("Products"));
      enter(trigger("Products"));
      await wait(300);
      expect(isOpen("Products")).toBe(true);
      expect(changes(onValueChange)).toEqual([
        ["products", "trigger-hover"],
        [null, "trigger-press"],
        ["products", "trigger-hover"],
      ]);
    });

    it("opens nothing on a touch", async () => {
      await render(() => <Site />);

      enter(trigger("Products"), "touch");
      await wait(1000);

      expect(isOpen("Products")).toBe(false);
    });
  });

  describe("Escape", () => {
    it("closes the open Panel, reporting escape-key, and marks the key handled", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);
      fireEvent.click(trigger("Products"));
      await afterFlush();
      onValueChange.mockClear();

      const handled = fireEvent.keyDown(document.body, { key: "Escape" });
      await afterFlush();

      expect(handled).toBe(false);
      expect(isOpen("Products")).toBe(false);
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null, {
        reason: "escape-key",
        event: expect.objectContaining({ type: "keydown", key: "Escape" }),
      });
    });

    it("returns focus to the Trigger when focus was inside the Item", async () => {
      await render(() => <Site />);
      fireEvent.click(trigger("Products"));
      await afterFlush();
      link("Tabs").focus();

      fireEvent.keyDown(link("Tabs"), { key: "Escape" });
      await afterFlush();

      expect(isOpen("Products")).toBe(false);
      expect(document.activeElement).toBe(trigger("Products"));
    });

    it("leaves focus where it is when it was outside the Item", async () => {
      await render(() => <Site />);
      fireEvent.click(trigger("Products"));
      await afterFlush();
      const before = screen.getByRole("button", { name: "Before" });
      before.focus();

      fireEvent.keyDown(before, { key: "Escape" });
      await afterFlush();

      expect(isOpen("Products")).toBe(false);
      expect(document.activeElement).toBe(before);
    });

    it("does nothing with nothing open, and leaves the key unhandled", async () => {
      const onValueChange = vi.fn();
      await render(() => <Site onValueChange={onValueChange} />);

      const handled = fireEvent.keyDown(document.body, { key: "Escape" });

      expect(handled).toBe(true);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  it("stays open when focus inside is lost to nothing, as when the window loses focus", async () => {
    const onValueChange = vi.fn();
    await render(() => <Site onValueChange={onValueChange} />);
    fireEvent.click(trigger("Products"));
    await afterFlush();
    link("Switch").focus();
    onValueChange.mockClear();

    // A blur with no element taking focus, as the window's is.
    link("Switch").blur();
    await afterFlush();

    expect(document.activeElement).toBe(document.body);
    expect(isOpen("Products")).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("listens to the document only while a Panel is open", async () => {
    await render(() => <Site />);
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const types = (spy: typeof add) =>
      spy.mock.calls.map(([type]) => type).sort();
    // A mouse entering a Trigger adds nothing to the document while closed.
    enter(trigger("Products"));
    leave(trigger("Products"));
    expect(types(add)).toEqual([]);

    fireEvent.click(trigger("Products"));
    await afterFlush();
    const added = types(add);
    expect(added).toEqual(
      expect.arrayContaining(["click", "keydown", "pointerdown"]),
    );

    fireEvent.click(trigger("Products"));
    await afterFlush();
    expect(types(remove)).toEqual(added);
  });

  describe("in Chromium", () => {
    beforeEach(async () => {
      if (!isJSDOM) await movePointer([away]);
    });

    it.skipIf(isJSDOM)(
      "opens nothing for a pointer sweeping across the bar, and opens on resting",
      async () => {
        await render(() => <Site />);
        const start = { x: 2, y: 15 };
        const end = { x: 300, y: 15 };

        // 20 moves over 300 px, which Chromium takes about one frame each
        // to deliver: about 1 px a millisecond, measured at 333 ms, so about
        // 110 ms over each Trigger. A slow sweep for a pointer on its way
        // down the page.
        await movePointer(line(away, start, 5));
        await movePointer(line(start, end, 20));
        await movePointer(line(end, away, 5));
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(isOpen("Products")).toBe(false);
        expect(isOpen("Docs")).toBe(false);

        await movePointer([centerOf(trigger("Docs"))]);
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(isOpen("Docs")).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "keeps a Panel open while the pointer crosses the gap onto it, and closes it once the pointer leaves both",
      async () => {
        await render(() => <Site delay={0} closeDelay={0} />);
        await movePointer([centerOf(trigger("Products"))]);
        await afterFlush();
        expect(isOpen("Products")).toBe(true);

        await movePointer(
          line(centerOf(trigger("Products")), centerOf(panel("Products"))),
        );
        await nextTask();
        expect(isOpen("Products")).toBe(true);

        await movePointer(line(centerOf(panel("Products")), away));
        await nextTask();
        expect(isOpen("Products")).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "stays open while the pointer rests on a Panel that hover opened, past closeDelay",
      async () => {
        await render(() => <Site />);
        await movePointer([centerOf(trigger("Products"))]);
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(isOpen("Products")).toBe(true);

        await movePointer(
          line(centerOf(trigger("Products")), centerOf(panel("Products"))),
        );
        // Twice the default closeDelay, 200 ms.
        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(isOpen("Products")).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "closes a Panel that hover opened on Escape, with the pointer on its Trigger and then on it, and keeps it closed",
      async () => {
        const onValueChange = vi.fn();
        await render(() => <Site onValueChange={onValueChange} />);
        await movePointer([centerOf(trigger("Products"))]);
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(isOpen("Products")).toBe(true);

        await keyboard("{Escape}");
        await afterFlush();
        expect(isOpen("Products")).toBe(false);
        // Longer than the delay, with the pointer still on the Trigger.
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(isOpen("Products")).toBe(false);

        // Back onto the Trigger, then onto the open Panel.
        await movePointer(line(centerOf(trigger("Products")), away, 3));
        await movePointer([centerOf(trigger("Products"))]);
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(isOpen("Products")).toBe(true);
        const onPanel = centerOf(panel("Products"));
        await movePointer(line(centerOf(trigger("Products")), onPanel));
        await nextTask();
        expect(isOpen("Products")).toBe(true);

        await keyboard("{Escape}");
        await afterFlush();
        expect(isOpen("Products")).toBe(false);
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(isOpen("Products")).toBe(false);
        expect(changes(onValueChange)).toEqual([
          ["products", "trigger-hover"],
          [null, "escape-key"],
          ["products", "trigger-hover"],
          [null, "escape-key"],
        ]);
      },
    );

    it.skipIf(isJSDOM)(
      "opens the next Trigger's Panel at once for a pointer moving along the bar, with one onValueChange",
      async () => {
        const onValueChange = vi.fn();
        await render(() => <Site onValueChange={onValueChange} />);
        await movePointer([centerOf(trigger("Products"))]);
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(isOpen("Products")).toBe(true);
        onValueChange.mockClear();

        // Across the edge between the Triggers, out of the safe area that
        // leaving Products for its Panel below starts.
        await movePointer(
          line(centerOf(trigger("Products")), centerOf(trigger("Docs"))),
        );
        await afterFlush();

        expect(isOpen("Docs")).toBe(true);
        expect(isOpen("Products")).toBe(false);
        // Past the default closeDelay, 200 ms, of the Products close.
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(isOpen("Docs")).toBe(true);
        expect(changes(onValueChange)).toEqual([["docs", "trigger-hover"]]);
      },
    );

    it.skipIf(isJSDOM)(
      "stays open when a press on a Panel's text takes focus from a link in it",
      async () => {
        await render(() => <Site />);
        trigger("Products").focus();
        await keyboard("{Enter}");
        await afterFlush();
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Switch"));

        await press(centerOf(screen.getByText("Every component")));
        await afterFlush();

        expect(document.activeElement).toBe(document.body);
        expect(isOpen("Products")).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "toggles on a tap, and opens nothing on hover from it",
      async () => {
        await render(() => <Site delay={0} />);

        await tap(centerOf(trigger("Products")));
        await nextTask();
        expect(isOpen("Products")).toBe(true);

        await tap(centerOf(trigger("Products")));
        await nextTask();
        expect(isOpen("Products")).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "returns focus to the Trigger on Escape from a link in its Panel",
      async () => {
        await render(() => <Site />);
        trigger("Products").focus();
        await keyboard("{Enter}");
        await afterFlush();
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Switch"));

        await keyboard("{Escape}");
        await afterFlush();

        expect(isOpen("Products")).toBe(false);
        expect(document.activeElement).toBe(trigger("Products"));
      },
    );

    it.skipIf(isJSDOM)(
      "closes, reporting focus-out, when Tab moves focus out of the nav",
      async () => {
        const onValueChange = vi.fn();
        await render(() => <Site onValueChange={onValueChange} />);
        trigger("Docs").focus();
        await keyboard("{Enter}");
        await afterFlush();
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Guides"));
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Blog"));
        expect(isOpen("Docs")).toBe(true);

        await keyboard("{Tab}");
        await afterFlush();

        expect(document.activeElement).toBe(
          screen.getByRole("button", { name: "After" }),
        );
        expect(isOpen("Docs")).toBe(false);
        expect(changes(onValueChange).at(-1)).toEqual([null, "focus-out"]);
      },
    );

    it.skipIf(isJSDOM)(
      "closes when Shift+Tab moves focus out of the nav",
      async () => {
        await render(() => <Site />);
        trigger("Products").focus();
        await keyboard("{Enter}");
        await afterFlush();

        await keyboard("{Shift>}{Tab}{/Shift}");
        await afterFlush();

        expect(document.activeElement).toBe(
          screen.getByRole("button", { name: "Before" }),
        );
        expect(isOpen("Products")).toBe(false);
      },
    );

    it.skipIf(isJSDOM)(
      "stays open while focus moves inside the nav, into the Panel and to another Trigger",
      async () => {
        await render(() => <Site />);
        trigger("Products").focus();
        await keyboard("{Enter}");
        await afterFlush();

        await keyboard("{Tab}{Tab}");
        expect(document.activeElement).toBe(link("Tabs"));
        expect(isOpen("Products")).toBe(true);
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(trigger("Docs"));
        await afterFlush();
        expect(isOpen("Products")).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "keeps a Panel that hover opened open once Tab has moved focus into it and the pointer leaves",
      async () => {
        await render(() => <Site delay={0} closeDelay={0} />);
        await movePointer([centerOf(trigger("Products"))]);
        await afterFlush();
        expect(isOpen("Products")).toBe(true);
        trigger("Products").focus();
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Switch"));

        await movePointer(line(centerOf(trigger("Products")), away));
        await nextTask();

        expect(isOpen("Products")).toBe(true);
        expect(document.activeElement).toBe(link("Switch"));
      },
    );

    it.skipIf(isJSDOM)(
      "closes on a press outside, on release, reporting outside-press",
      async () => {
        const onValueChange = vi.fn();
        await render(() => <Site onValueChange={onValueChange} />);
        fireEvent.click(trigger("Products"));
        await afterFlush();
        onValueChange.mockClear();

        await press(away);
        await afterFlush();

        expect(isOpen("Products")).toBe(false);
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null, {
          reason: "outside-press",
          event: expect.objectContaining({ type: "click" }),
        });
      },
    );

    it.skipIf(isJSDOM)(
      "closes on release, reporting outside-press, on a press on a focusable element outside while focus is inside",
      async () => {
        const onValueChange = vi.fn();
        await render(() => <Site onValueChange={onValueChange} />);
        trigger("Products").focus();
        await keyboard("{Enter}");
        await afterFlush();
        await keyboard("{Tab}");
        expect(document.activeElement).toBe(link("Switch"));
        onValueChange.mockClear();
        const after = screen.getByRole("button", { name: "After" });

        await press(centerOf(after));
        await afterFlush();

        expect(document.activeElement).toBe(after);
        expect(isOpen("Products")).toBe(false);
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null, {
          reason: "outside-press",
          event: expect.objectContaining({ type: "click" }),
        });
      },
    );

    it.skipIf(isJSDOM)("stays open on a press on a Panel's text", async () => {
      await render(() => <Site />);
      fireEvent.click(trigger("Products"));
      await afterFlush();

      await press(centerOf(screen.getByText("Every component")));
      await afterFlush();

      expect(isOpen("Products")).toBe(true);
    });

    it.skipIf(isJSDOM)(
      "stays open on a press that starts inside and ends outside",
      async () => {
        await render(() => <Site />);
        fireEvent.click(trigger("Products"));
        await afterFlush();

        await press(centerOf(screen.getByText("Every component")), away);
        await afterFlush();

        expect(isOpen("Products")).toBe(true);
      },
    );

    it.skipIf(isJSDOM)(
      "stays open on a secondary-button press outside",
      async () => {
        await render(() => <Site />);
        fireEvent.click(trigger("Products"));
        await afterFlush();

        await press(away, away, "right");
        await afterFlush();

        expect(isOpen("Products")).toBe(true);
      },
    );
  });
});
