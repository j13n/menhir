import {
  cleanup,
  configure,
  render as solidRender,
} from "@solidjs/testing-library";
import { userEvent } from "@testing-library/user-event";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { expectNoDiagnostics } from "@solidjs/diagnostics";
import { afterEach, beforeEach } from "vitest";

import { captureDiagnostics } from "./diagnostics.ts";

// Solid 2.0 applies updates in a microtask, so the DOM lags behind an event
// until then. Flushing after every event Testing Library dispatches (through
// fireEvent and user-event alike) lets an assertion follow an event directly,
// as Base UI's tests do after React's act(). A part's own state lands a
// microtask later (`onFlush`), so a test of it awaits `afterFlush()` first;
// user-event's actions already wait that long.
configure({
  eventWrapper(dispatch) {
    try {
      return dispatch();
    } finally {
      flush();
    }
  },
});

interface RenderOptions {
  /**
   * The element `renderOnServer` returned. The UI hydrates its HTML instead
   * of rendering from scratch, so `ui` must be the fixture that produced it.
   */
  hydrate?: HTMLElement;
}

interface RendererOptions {
  /**
   * Fail each test that reports a Solid dev diagnostic (default `true`).
   * Turn it off only for a test that trips one on purpose.
   */
  diagnostics?: boolean;
}

/**
 * Call once per `describe`, as in Base UI's tests. Every UI rendered in that
 * block is unmounted and removed after each test, and a test fails if Solid
 * reported a dev diagnostic while it ran (PLAN.md section 10).
 */
export function createRenderer(options: RendererOptions = {}) {
  // Registered before the cleanup, so that it ends after it: Vitest runs
  // afterEach hooks in reverse order. Diagnostics reported while the UI is
  // disposed count too.
  if (options.diagnostics !== false) {
    let capture: ReturnType<typeof captureDiagnostics> | undefined;
    beforeEach(() => {
      capture = captureDiagnostics();
    });
    afterEach(async () => {
      const artifact = await capture?.stop();
      capture = undefined;
      if (artifact) expectNoDiagnostics(artifact);
    });
  }
  // The testing library registers its cleanup only when Vitest globals are
  // on; they are off here.
  afterEach(cleanup);

  async function render(ui: () => JSX.Element, options: RenderOptions = {}) {
    const user = userEvent.setup();
    if (!options.hydrate) return { ...solidRender(ui), user };
    return {
      ...solidRender(ui, { container: options.hydrate, hydrate: true }),
      user,
    };
  }

  return { render };
}
