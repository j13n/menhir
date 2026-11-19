import { describe, expect, test } from "vitest";

import {
  CYCLE_STEPS,
  DAY_STEPS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  sceneFrame,
  STONES,
} from "./menhirFrames";

const GROUND_ROW = SCENE_HEIGHT - 2;

/** Every step of the day and night on which a stone stands. */
function stepsOf(stoneIndex: number) {
  return Array.from(
    { length: CYCLE_STEPS },
    (_, i) => stoneIndex * CYCLE_STEPS + i,
  );
}
const allSteps = STONES.flatMap((_, i) => stepsOf(i));
const isDay = (step: number) => step % CYCLE_STEPS < DAY_STEPS;

const lines = (step: number) => sceneFrame(step).text.split("\n");
const ground = (step: number) => lines(step)[GROUND_ROW];

describe("sceneFrame", () => {
  test("every frame is a fixed-size block of printable ASCII", () => {
    for (const step of allSteps) {
      expect(lines(step)).toHaveLength(SCENE_HEIGHT);
      for (const line of lines(step)) {
        expect(line).toHaveLength(SCENE_WIDTH);
        expect(line).toMatch(/^[\x20-\x7e]*$/);
      }
    }
  });

  test("each day has the next stone, and the stones take turns", () => {
    STONES.forEach((stone, i) => {
      for (const step of stepsOf(i)) {
        expect(sceneFrame(step).stone).toBe(stone.name);
      }
    });
    expect(sceneFrame(STONES.length * CYCLE_STEPS).stone).toBe(STONES[0].name);
    expect(new Set(STONES.map((s) => s.name)).size).toBe(STONES.length);
  });

  test("the stone stands whole on the ground, in front of everything", () => {
    STONES.forEach((stone, i) => {
      const top = GROUND_ROW - stone.art.length + 1;
      for (const step of stepsOf(i)) {
        stone.art.forEach((row, r) => {
          expect(lines(step)[top + r]).toContain(row.trim());
        });
      }
    });
  });

  test("the stones fit the sky and use none of its symbols", () => {
    for (const stone of STONES) {
      expect(stone.art.length).toBeLessThanOrEqual(GROUND_ROW - 2);
      for (const row of stone.art) {
        expect(row).not.toMatch(/[O*+=]/);
        expect(row.trimEnd().length).toBeLessThanOrEqual(SCENE_WIDTH / 2);
      }
    }
  });

  test("the sun is up by day and the stars are out by night", () => {
    for (const step of allSteps) {
      const frame = sceneFrame(step);
      if (isDay(step)) {
        expect(frame.phase).toBe("day");
        expect(frame.text).toContain("-- O --");
        expect(frame.text).not.toMatch(/[*+]/);
      } else {
        expect(frame.phase).toBe("night");
        expect(frame.text).not.toContain("O");
        expect(frame.text).toMatch(/[*+]/);
      }
    }
  });

  test.each(STONES.map((stone, i) => [stone.name, i] as const))(
    "the %s stone's shadow falls away from the sun, like a sundial's",
    (_, i) => {
      const base = STONES[i].art.at(-1)!.trim();
      const morning = i * CYCLE_STEPS + Math.round(DAY_STEPS * 0.15);
      const afternoon = i * CYCLE_STEPS + Math.round(DAY_STEPS * 0.85);
      expect(sceneFrame(morning).shadow).toBe("right");
      expect(sceneFrame(afternoon).shadow).toBe("left");

      const [beforeStone, afterStone] = ground(morning).split(base);
      expect(afterStone).toMatch(/^=+/);
      expect(beforeStone).not.toContain("=");
    },
  );

  test.each(STONES.map((stone, i) => [stone.name, i] as const))(
    "the %s stone's shadow is long at sunrise and shortest at noon",
    (_, i) => {
      const lengths = stepsOf(i)
        .slice(0, DAY_STEPS)
        .map((s) => sceneFrame(s).shadowLength);
      const noon = DAY_STEPS / 2;
      const shortest = lengths.indexOf(Math.min(...lengths));
      expect(Math.abs(shortest - noon)).toBeLessThanOrEqual(3);
      expect(lengths[0]).toBeGreaterThan(lengths[noon] + 10);
    },
  );

  test("a taller stone casts a longer shadow", () => {
    const morning = Math.round(DAY_STEPS * 0.3);
    const shadowOf = (name: string) => {
      const i = STONES.findIndex((s) => s.name === name);
      return sceneFrame(i * CYCLE_STEPS + morning).shadowLength;
    };
    expect(shadowOf("leaning")).toBeGreaterThan(shadowOf("squat"));
  });

  test("the moon casts a fainter shadow than the sun", () => {
    const step = DAY_STEPS + 4;
    const moonlit = sceneFrame(step);
    expect(moonlit.shadowLength).toBeGreaterThan(0);
    expect(ground(step)).toContain("-".repeat(moonlit.shadowLength));
    expect(ground(step)).not.toContain("=");
  });

  test("any step, even a negative or fractional one, maps onto the cycle", () => {
    const loop = STONES.length * CYCLE_STEPS;
    expect(sceneFrame(loop).text).toBe(sceneFrame(0).text);
    expect(sceneFrame(-1).text).toBe(sceneFrame(loop - 1).text);
    expect(sceneFrame(7.9).text).toBe(sceneFrame(7).text);
  });

  test("consecutive frames differ, so playing it looks like motion", () => {
    for (const step of allSteps) {
      expect(sceneFrame(step + 1).text).not.toBe(sceneFrame(step).text);
    }
  });
});
