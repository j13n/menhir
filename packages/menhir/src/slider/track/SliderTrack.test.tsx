// The test list and the cases left out are in ../README.md. The pointer
// cases send real input to Chromium, since jsdom lays nothing out.
import { describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { Slider } from "../index.ts";
import type { SliderRootProps } from "../root/SliderRoot.tsx";

const slider = () => screen.getByRole<HTMLInputElement>("slider");
const value = () => Number(slider().value);
const track = () => screen.getByTestId("track");
const thumb = () => screen.getByTestId("thumb");

describeConformance(
  "<Slider.Track />",
  (props) => (
    <Slider.Root>
      <Slider.Track {...props} />
    </Slider.Root>
  ),
  { tagName: "DIV" },
);

/**
 * A slider laid out as a consumer's CSS would: a track 200 px long and a
 * thumb 20 px wide centred on `--slider`, so a pixel is half a unit of the
 * default range.
 */
function Volume(props: SliderRootProps & { dir?: string }) {
  const vertical = () => props.orientation === "vertical";
  return (
    <div dir={props.dir} style={{ padding: "40px" }}>
      <Slider.Root {...props}>
        <Slider.Track
          data-testid="track"
          style={{
            position: "relative",
            width: vertical() ? "20px" : "200px",
            height: vertical() ? "200px" : "20px",
          }}
        >
          <Slider.Thumb
            data-testid="thumb"
            aria-label="Volume"
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              ...(vertical()
                ? { bottom: "calc(var(--slider) - 10px)" }
                : { "inset-inline-start": "calc(var(--slider) - 10px)" }),
            }}
          />
        </Slider.Track>
      </Slider.Root>
    </div>
  );
}

interface Point {
  x: number;
  y: number;
}

/** The point `along` pixels from the track's left edge, or from its top. */
function onTrack(along: number, vertical = false): Point {
  const { left, top, width, height } = track().getBoundingClientRect();
  return vertical
    ? { x: left + width / 2, y: top + along }
    : { x: left + along, y: top + height / 2 };
}

/** Pointer events land with the next frame, as the browser aligns them. */
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Real mouse input in Chromium, through the DevTools protocol. A move
 * holds the button down, as a drag does.
 */
async function mouse(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  point: Point,
  button: "left" | "right" = "left",
) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    ...point,
    button,
    buttons: type === "mouseReleased" ? 0 : button === "left" ? 1 : 2,
    clickCount: 1,
  });
  await nextFrame();
  await afterFlush();
}

/** Real touch input in Chromium; no points ends or cancels the touch. */
async function touch(
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  point?: Point,
) {
  const { cdp } = await import("vitest/browser");
  await cdp().send("Input.dispatchTouchEvent", {
    type,
    touchPoints: point ? [point] : [],
  });
  await nextFrame();
  await afterFlush();
}

describe("<Slider.Track />", () => {
  const { render } = createRenderer();

  it("renders a div with touch-action: none", async () => {
    await render(() => <Volume />);

    expect(track().tagName).toBe("DIV");
    expect(track().style.touchAction).toBe("none");
  });

  it.skipIf(isJSDOM)(
    "moves the thumb to a press, and focuses the input without :focus-visible",
    async () => {
      const onValueChange = vi.fn();
      await render(() => (
        <Volume defaultValue={0} onValueChange={onValueChange} />
      ));

      await mouse("mousePressed", onTrack(50));
      await mouse("mouseReleased", onTrack(50));

      expect(value()).toBe(25);
      expect(onValueChange.mock.calls).toEqual([[25]]);
      expect(slider()).toHaveFocus();
      expect(slider().matches(":focus-visible")).toBe(false);
      expect(window.getSelection()?.toString()).toBe("");
    },
  );

  it.skipIf(isJSDOM)(
    "follows a drag, outside the track too, on the grid and clamped, and commits once on release",
    async () => {
      const onValueChange = vi.fn();
      const onValueCommit = vi.fn();
      await render(() => (
        <Volume
          defaultValue={0}
          step={10}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
        />
      ));

      await mouse("mousePressed", onTrack(41));
      expect(value()).toBe(20);
      await mouse("mouseMoved", onTrack(119));
      expect(value()).toBe(60);
      await mouse("mouseMoved", { ...onTrack(150), y: 0 });
      expect(value()).toBe(80);
      await mouse("mouseMoved", onTrack(400));
      expect(value()).toBe(100);
      expect(onValueCommit).not.toHaveBeenCalled();
      await mouse("mouseReleased", onTrack(400));

      expect(onValueChange.mock.calls).toEqual([[20], [60], [80], [100]]);
      expect(onValueCommit.mock.calls).toEqual([[100]]);

      // Moves after the release move nothing.
      const { cdp } = await import("vitest/browser");
      await cdp().send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        ...onTrack(10),
      });
      await nextFrame();
      await afterFlush();
      expect(value()).toBe(100);
    },
  );

  it.skipIf(isJSDOM)(
    "commits once when the drag ends, though a key was pressed and released during it",
    async () => {
      const onValueCommit = vi.fn();
      await render(() => (
        <Volume defaultValue={0} onValueCommit={onValueCommit} />
      ));

      await mouse("mousePressed", onTrack(50));
      fireEvent.keyDown(slider(), { key: "Shift" });
      fireEvent.keyUp(slider(), { key: "Shift" });
      fireEvent.keyDown(slider(), { key: "ArrowRight" });
      fireEvent.keyUp(slider(), { key: "ArrowRight" });
      await afterFlush();
      expect(value()).toBe(26);
      expect(onValueCommit).not.toHaveBeenCalled();
      await mouse("mouseMoved", onTrack(100));
      await mouse("mouseReleased", onTrack(100));

      expect(onValueCommit.mock.calls).toEqual([[50]]);
    },
  );

  it.skipIf(isJSDOM)(
    "keeps the value when the thumb is pressed off its centre, and commits nothing",
    async () => {
      const onValueCommit = vi.fn();
      await render(() => (
        <Volume defaultValue={50} onValueCommit={onValueCommit} />
      ));
      const { left, width, top, height } = thumb().getBoundingClientRect();
      const offCentre = { x: left + width - 2, y: top + height / 2 };

      await mouse("mousePressed", offCentre);
      expect(value()).toBe(50);
      // The drag keeps the distance from the centre: 10 px is 5 units.
      await mouse("mouseMoved", { ...offCentre, x: offCentre.x + 10 });
      expect(value()).toBe(55);
      await mouse("mouseMoved", offCentre);
      await mouse("mouseReleased", offCentre);

      expect(value()).toBe(50);
      expect(onValueCommit).not.toHaveBeenCalled();
    },
  );

  it.skipIf(isJSDOM)("runs from the bottom up when vertical", async () => {
    await render(() => <Volume defaultValue={0} orientation="vertical" />);

    await mouse("mousePressed", onTrack(50, true));
    await mouse("mouseReleased", onTrack(50, true));

    expect(value()).toBe(75);
  });

  it.skipIf(isJSDOM)("runs from the right right to left", async () => {
    await render(() => <Volume defaultValue={0} dir="rtl" />);

    await mouse("mousePressed", onTrack(50));
    await mouse("mouseReleased", onTrack(50));

    expect(value()).toBe(75);
    // The consumer's logical inset places the thumb under the pointer.
    const { left, width } = thumb().getBoundingClientRect();
    expect(left + width / 2).toBeCloseTo(onTrack(50).x, 0);
  });

  it.skipIf(isJSDOM)("moves nothing for a secondary button", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Volume defaultValue={0} onValueChange={onValueChange} />
    ));

    await mouse("mousePressed", onTrack(100), "right");
    await mouse("mouseReleased", onTrack(100), "right");
    expect(value()).toBe(0);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.skipIf(isJSDOM)("moves nothing while disabled", async () => {
    const onValueChange = vi.fn();
    await render(() => (
      <Volume defaultValue={0} disabled onValueChange={onValueChange} />
    ));

    await mouse("mousePressed", onTrack(100));
    await mouse("mouseReleased", onTrack(100));

    expect(value()).toBe(0);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(slider()).not.toHaveFocus();
  });

  it.skipIf(isJSDOM)(
    "follows a touch drag without scrolling the page, and commits when the touch is canceled",
    async () => {
      const onValueCommit = vi.fn();
      document.body.style.height = "300vh";
      try {
        await render(() => (
          <Volume defaultValue={0} onValueCommit={onValueCommit} />
        ));
        const start = onTrack(20);

        await touch("touchStart", start);
        expect(value()).toBe(10);
        for (let step = 1; step <= 4; step++) {
          await touch("touchMove", {
            x: start.x + step * 20,
            y: start.y - step * 40,
          });
        }
        expect(value()).toBe(50);
        expect(window.scrollY).toBe(0);
        await touch("touchCancel");

        expect(onValueCommit.mock.calls).toEqual([[50]]);
      } finally {
        document.body.style.height = "";
      }
    },
  );
});
