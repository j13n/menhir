// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, isJSDOM } from "#test-utils";

import { Notifications, toast } from "../../../test/toast/Notifications.tsx";
import type { TestData } from "../../../test/toast/Notifications.tsx";
import { createToastManager, Toast } from "../index.ts";

// Layout and ResizeObserver: jsdom has neither.
describe.skipIf(isJSDOM)("Toast.measure", () => {
  const { render } = createRenderer();

  const sizes = (...ids: string[]) =>
    ids.map((id) => [
      toast(id).style.getPropertyValue("--toast-height"),
      toast(id).style.getPropertyValue("--toast-offset"),
    ]);

  it("gives each toast its height and the heights of the newer ones, kept as toasts come, change and leave", async () => {
    const toasts = createToastManager<TestData>();
    const first = toasts.add({
      title: <div style={{ height: "40px" }}>First</div>,
      duration: Infinity,
    });
    const second = toasts.add({
      title: <div style={{ height: "60px" }}>Second</div>,
      duration: Infinity,
    });
    await render(() => (
      <Notifications toasts={toasts} regionRef={Toast.measure()} />
    ));
    // The Close button of the fixture has a height of its own.
    const close = toast(first).offsetHeight - 40;

    await vi.waitFor(() =>
      expect(sizes(first, second)).toEqual([
        [`${40 + close}px`, `${60 + close}px`],
        [`${60 + close}px`, "0px"],
      ]),
    );

    const third = toasts.add({
      title: <div style={{ height: "20px" }}>Third</div>,
      duration: Infinity,
    });
    flush();
    await vi.waitFor(() =>
      expect(sizes(first, second, third)).toEqual([
        [`${40 + close}px`, `${80 + 2 * close}px`],
        [`${60 + close}px`, `${20 + close}px`],
        [`${20 + close}px`, "0px"],
      ]),
    );

    toasts.update(third, {
      title: <div style={{ height: "30px" }}>Third</div>,
    });
    flush();
    await vi.waitFor(() =>
      expect(sizes(first, second)).toEqual([
        [`${40 + close}px`, `${90 + 2 * close}px`],
        [`${60 + close}px`, `${30 + close}px`],
      ]),
    );

    toasts.remove(second);
    flush();
    await afterFlush();
    await vi.waitFor(() =>
      expect(sizes(first, third)).toEqual([
        [`${40 + close}px`, `${30 + close}px`],
        [`${30 + close}px`, "0px"],
      ]),
    );
  });
});
