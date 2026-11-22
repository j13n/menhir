import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, isJSDOM } from "#test-utils";

import { centerOf, line, movePointer } from "../../../test/floating/input.ts";
import { trackListeners } from "../../../test/floating/listeners.ts";
import { trackSafeArea } from "./safeArea.ts";

/** An element whose box is `rect`, in the document. */
function elementAt(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const element = document.createElement("div");
  document.body.append(element);
  vi.spyOn(element, "getBoundingClientRect").mockImplementation(() =>
    DOMRect.fromRect(rect),
  );
  return element;
}

function move(clientX: number, clientY: number) {
  fireEvent.pointerMove(document.body, { clientX, clientY });
}

describe("trackSafeArea", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  // A popup 100 by 50 at (0, 100), below a trigger the pointer left at
  // (50, 90), its bottom edge.
  const below = { x: 0, y: 100, width: 100, height: 50 };
  const exit = { clientX: 50, clientY: 90 };

  it("reports nothing for a move towards the element, and onto it", () => {
    const onLeave = vi.fn();
    trackSafeArea(exit, elementAt(below), onLeave);

    move(52, 93);
    move(40, 98);
    move(10, 120);

    expect(onLeave).not.toHaveBeenCalled();
  });

  it.each([
    ["away from the element", 50, 85],
    ["sideways out of the shape", 120, 92],
    ["past the element", 50, 160],
  ])(
    "reports a move %s once, with the move, and stops listening",
    (_, x, y) => {
      const onLeave = vi.fn();
      trackSafeArea(exit, elementAt(below), onLeave);

      move(x, y);
      move(50, 120);
      move(x, y);

      expect(onLeave).toHaveBeenCalledOnce();
      const [event] = onLeave.mock.calls[0]!;
      expect(event).toMatchObject({
        type: "pointermove",
        clientX: x,
        clientY: y,
      });
    },
  );

  it("counts a move at the point where the pointer left as inside", () => {
    const onLeave = vi.fn();
    trackSafeArea(exit, elementAt(below), onLeave);

    move(50, 90);

    expect(onLeave).not.toHaveBeenCalled();
  });

  // An element 100 by 100 at (100, 100), and the pointer leaving from each
  // side of it, or from a corner. One move stays inside, the other goes
  // out.
  it.each([
    ["above", { clientX: 150, clientY: 80 }, [150, 95], [150, 70]],
    ["below", { clientX: 150, clientY: 220 }, [140, 210], [150, 230]],
    ["left of", { clientX: 80, clientY: 150 }, [95, 140], [70, 150]],
    ["right of", { clientX: 220, clientY: 150 }, [210, 160], [230, 150]],
    ["diagonally from", { clientX: 80, clientY: 80 }, [90, 95], [70, 85]],
  ] as const)(
    "with the pointer leaving %s the element: inside and outside",
    (_, from, inside, outside) => {
      const onLeave = vi.fn();
      trackSafeArea(
        from,
        elementAt({ x: 100, y: 100, width: 100, height: 100 }),
        onLeave,
      );

      move(inside[0], inside[1]);
      expect(onLeave).not.toHaveBeenCalled();
      move(outside[0], outside[1]);
      expect(onLeave).toHaveBeenCalledOnce();
    },
  );

  it("follows the element when it moves", () => {
    const rect = { ...below };
    const onLeave = vi.fn();
    const element = elementAt(below);
    vi.mocked(element.getBoundingClientRect).mockImplementation(() =>
      DOMRect.fromRect(rect),
    );
    trackSafeArea(exit, element, onLeave);

    // Moved right, out from under the pointer's line straight down.
    rect.x = 200;
    move(50, 95);

    expect(onLeave).toHaveBeenCalledOnce();
  });

  it("reports the pointer leaving the window, with the pointerout", () => {
    const onLeave = vi.fn();
    const element = elementAt(below);
    trackSafeArea(exit, element, onLeave);

    // Going from one element to another is not leaving.
    fireEvent.pointerOut(document.body, { relatedTarget: element });
    expect(onLeave).not.toHaveBeenCalled();
    fireEvent.pointerOut(document.body, { relatedTarget: null });

    expect(onLeave).toHaveBeenCalledOnce();
    expect(onLeave.mock.calls[0]![0].type).toBe("pointerout");
  });

  it("ignores a touch, such as a tap elsewhere while the mouse is in the gap", () => {
    const onLeave = vi.fn();
    trackSafeArea(exit, elementAt(below), onLeave);

    fireEvent.pointerMove(document.body, {
      pointerType: "touch",
      clientX: 300,
      clientY: 10,
    });
    // A touch's pointer leaves after `pointerup`, to nothing.
    fireEvent.pointerOut(document.body, {
      pointerType: "touch",
      relatedTarget: null,
    });

    expect(onLeave).not.toHaveBeenCalled();
  });

  it("stops listening when stopped, and reports nothing after", () => {
    const listeners = trackListeners();
    listeners.mark();
    const onLeave = vi.fn();
    const stop = trackSafeArea(exit, elementAt(below), onLeave);
    expect(listeners.added()).toEqual(["pointermove", "pointerout"]);

    stop();
    move(50, 85);

    expect(listeners.added()).toEqual([]);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)(
    "stays inside for a real pointer crossing a gap, and leaves for one that turns away",
    async () => {
      document.body.innerHTML = `
        <div id="from" style="position: fixed; left: 20px; top: 20px; width: 80px; height: 30px"></div>
        <div id="to" style="position: fixed; left: 20px; top: 80px; width: 120px; height: 40px"></div>`;
      const from = document.getElementById("from")!;
      const to = document.getElementById("to")!;
      await movePointer([centerOf(from)]);
      const onLeave = vi.fn();
      let stop: (() => void) | undefined;
      from.addEventListener(
        "pointerleave",
        (event) => (stop = trackSafeArea(event, to, onLeave)),
        { once: true },
      );

      await movePointer(line(centerOf(from), centerOf(to)));
      expect(onLeave).not.toHaveBeenCalled();
      stop!();

      await movePointer([centerOf(from)]);
      from.addEventListener(
        "pointerleave",
        (event) => trackSafeArea(event, to, onLeave),
        { once: true },
      );
      // Out through the bottom, then off to the right, past the popup's end.
      const { x, y } = centerOf(from);
      await movePointer(line({ x, y }, { x, y: y + 25 }, 3));
      expect(onLeave).not.toHaveBeenCalled();
      await movePointer(line({ x, y: y + 25 }, { x: x + 200, y: y + 25 }, 5));
      expect(onLeave).toHaveBeenCalledOnce();
    },
  );
});
