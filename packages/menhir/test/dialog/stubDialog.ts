import { afterAll, beforeAll, vi } from "vitest";

import { isJSDOM } from "../isJSDOM.ts";

/**
 * In jsdom, which has no `showModal()`, `close()`, `getAnimations()` or
 * `ResizeObserver`, stands them in for the tests of the `describe` block it
 * is called in, so that a Dialog opens and closes: `showModal()` adds
 * `open`, `close()` removes it and fires `close`, as the browser does a
 * task later, and nothing animates. Does nothing in a browser.
 */
export function stubDialog(): void {
  if (!isJSDOM) return;
  const dialog = HTMLDialogElement.prototype as Partial<HTMLDialogElement>;
  const element = Element.prototype as Partial<Element>;
  beforeAll(() => {
    dialog.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    dialog.close = function (this: HTMLDialogElement) {
      if (!this.hasAttribute("open")) return;
      this.removeAttribute("open");
      setTimeout(() => this.dispatchEvent(new Event("close")));
    };
    element.getAnimations = () => [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });
  afterAll(() => {
    delete dialog.showModal;
    delete dialog.close;
    delete element.getAnimations;
    vi.unstubAllGlobals();
  });
}
