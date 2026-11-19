import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sceneStepAt } from "../timeOfDay";
import MenhirScene, { FRAME_MS } from "./MenhirScene";
import { CYCLE_STEPS, DAY_STEPS, sceneFrame, STONES } from "./menhirFrames";

/** The reader's clock in most tests: 15:00 local time. */
const AFTERNOON = new Date(2026, 10, 19, 15, 0);
const START = sceneStepAt(AFTERNOON);

/** Runs the animation clock forward by whole frames and applies the updates. */
function tick(frames = 1) {
  vi.advanceTimersByTime(frames * FRAME_MS);
  flush();
}

function setup(now = AFTERNOON) {
  vi.setSystemTime(now);
  const result = render(() => <MenhirScene />);
  flush();
  const scene = result.getByRole("img", { name: /menhir/i });
  const button = () => result.getByRole("button");
  return { ...result, scene, button };
}

/** jsdom has no matchMedia; this answers the reduced-motion query. */
function preferReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  );
}

/** Frames from `step` until the first later step for which `done` holds. */
function framesUntil(step: number, done: (s: number) => boolean) {
  let frames = 1;
  while (!done(step + frames)) frames++;
  return frames;
}

describe("<MenhirScene />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("is exposed as one labelled image, not as lines of punctuation", () => {
    const { scene } = setup();
    expect(scene.tagName).toBe("PRE");
    expect(scene).toHaveAccessibleName(
      "ASCII drawing of a menhir, a tall standing stone, as the sun and then the moon cross the sky over it.",
    );
  });

  test("opens on the frame for the reader's time of day", () => {
    const { scene } = setup();
    expect(scene.textContent).toBe(sceneFrame(START).text);
    expect(scene).toHaveAttribute("data-phase", "day");
  });

  test("opens on a night sky late in the evening", () => {
    const { scene } = setup(new Date(2026, 10, 19, 22, 30));
    expect(scene).toHaveAttribute("data-phase", "night");
    expect(scene).toHaveClass("bg-slate-900");
  });

  test("moves on one frame per tick", () => {
    const { scene } = setup();
    tick();
    expect(scene.textContent).toBe(sceneFrame(START + 1).text);
    tick(3);
    expect(scene.textContent).toBe(sceneFrame(START + 4).text);
  });

  test("turns to night colours when the sun sets, and back at dawn", () => {
    const { scene } = setup();
    expect(scene).toHaveAttribute("data-phase", "day");
    expect(scene).toHaveClass("bg-sky-50");

    const toSunset = framesUntil(START, (s) => sceneFrame(s).phase === "night");
    tick(toSunset);
    expect(scene).toHaveAttribute("data-phase", "night");
    expect(scene).toHaveClass("bg-slate-900");
    expect(scene).not.toHaveClass("bg-sky-50");

    tick(framesUntil(START + toSunset, (s) => sceneFrame(s).phase === "day"));
    expect(scene).toHaveAttribute("data-phase", "day");
  });

  test("a different stone stands after each dawn", () => {
    const { scene } = setup();
    const seen = [scene.dataset.stone];
    for (let day = 1; day < STONES.length; day++) {
      tick(CYCLE_STEPS);
      expect(scene).toHaveAttribute("data-phase", "day");
      seen.push(scene.dataset.stone);
    }
    expect(new Set(seen).size).toBe(STONES.length);
    expect(seen.toSorted()).toEqual(STONES.map((s) => s.name).toSorted());
  });

  test("the button pauses and resumes the animation", () => {
    const { scene, button } = setup();
    expect(button()).toHaveAccessibleName("Pause animation");

    fireEvent.click(button());
    flush();
    expect(button()).toHaveAccessibleName("Play animation");
    const paused = scene.textContent;
    tick(10);
    expect(scene.textContent).toBe(paused);

    fireEvent.click(button());
    flush();
    expect(button()).toHaveAccessibleName("Pause animation");
    tick();
    expect(scene.textContent).not.toBe(paused);
  });

  test("stays still for readers who prefer reduced motion, until asked", () => {
    preferReducedMotion(true);
    const { scene, button } = setup();
    expect(button()).toHaveAccessibleName("Play animation");
    tick(10);
    expect(scene.textContent).toBe(sceneFrame(START).text);

    fireEvent.click(button());
    flush();
    tick();
    expect(scene.textContent).toBe(sceneFrame(START + 1).text);
  });

  test("plays when the reader has no motion preference", () => {
    preferReducedMotion(false);
    const { button } = setup();
    expect(button()).toHaveAccessibleName("Pause animation");
  });

  test("stops its timer when paused and when unmounted", () => {
    const { button, unmount } = setup();
    expect(vi.getTimerCount()).toBe(1);

    fireEvent.click(button());
    flush();
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(button());
    flush();
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("runs a day, a night and a pause without tripping a Solid diagnostic", async () => {
    const { artifact } = await captureArtifact(
      () => {
        const { button } = setup();
        tick(DAY_STEPS);
        fireEvent.click(button());
        flush();
        fireEvent.click(button());
        flush();
        tick();
      },
      { scenario: "menhir-scene" },
    );
    expectNoDiagnostics(artifact);
  });
});
