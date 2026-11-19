import {
  cleanup,
  configure,
  render as solidRender,
} from "@solidjs/testing-library";
import { userEvent } from "@testing-library/user-event";
import type { JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { afterEach } from "vitest";

// Solid 2.0 applies updates in a microtask, so the DOM lags behind an event
// until then. Flushing after every event Testing Library dispatches (through
// fireEvent and user-event alike) lets an assertion follow an event directly,
// as Base UI's tests do after React's act().
configure({
  eventWrapper(dispatch) {
    try {
      return dispatch();
    } finally {
      flush();
    }
  },
});

/**
 * Call once per `describe`, as in Base UI's tests. Every UI rendered in that
 * block is unmounted and removed after each test.
 */
export function createRenderer() {
  // The testing library registers its cleanup only when Vitest globals are
  // on; they are off here.
  afterEach(cleanup);

  async function render(ui: () => JSX.Element) {
    const user = userEvent.setup();
    return { ...solidRender(ui), user };
  }

  return { render };
}
