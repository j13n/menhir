// A Select with several hundred items opens and moves without a pause
// (#102). The times measured are recorded in ./README.md, "Performance".
// Chromium only: jsdom has no layout to pay for.
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, fireEvent, isJSDOM } from "#test-utils";

import { Fruit } from "../../test/select/Fruit.tsx";
import { active, popup, shown, trigger } from "../../test/select/queries.ts";
import { Select } from "./index.ts";

const count = 500;
// Three frames at 60 Hz, in milliseconds: below what reads as a pause, and
// several times what was measured, so a slow machine does not fail it.
const budget = 50;

/**
 * The time a key takes: its handler, the flush after it (`fireEvent`), the
 * updates the part defers (`onFlush`), and the layout they cause.
 */
async function timed(key: string, init: KeyboardEventInit = {}) {
  const start = performance.now();
  fireEvent.keyDown(trigger(), { key, ...init });
  await afterFlush();
  // The list's own microtask, which scrolls the active item into view.
  await Promise.resolve();
  popup().getBoundingClientRect();
  return performance.now() - start;
}

describe.skipIf(isJSDOM)(`<Select /> with ${count} items`, () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("opens on the selected item, moves and types, each without a pause", async () => {
    await render(() => (
      <Fruit
        defaultValue={`item-${count - 100}`}
        popup={{
          style: {
            "max-height": "var(--available-height)",
            "overflow-y": "auto",
          },
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <Select.Item value={`item-${index}`}>Item {index}</Select.Item>
        ))}
      </Fruit>
    ));
    trigger().focus();

    const times: Record<string, number> = {};
    times.open = await timed("Enter");
    expect(shown()).toBe(true);
    expect(active()).toBe(`Item ${count - 100}`);
    times.down = await timed("ArrowDown");
    expect(active()).toBe(`Item ${count - 99}`);
    times.end = await timed("End");
    expect(active()).toBe(`Item ${count - 1}`);
    times.home = await timed("Home");
    expect(active()).toBe("Item 0");
    times.pageDown = await timed("PageDown");
    expect(active()).toBe("Item 10");
    times.type = await timed("i");
    expect(active()).toBe("Item 11");
    times.select = await timed("Enter");
    expect(shown()).toBe(false);

    const report = Object.entries(times)
      .map(([step, time]) => `${step} ${time.toFixed(1)}`)
      .join(", ");
    for (const time of Object.values(times))
      expect(time, `in ms: ${report}`).toBeLessThan(budget);
  });
});
