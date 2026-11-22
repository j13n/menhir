import { afterAll, beforeAll } from "vitest";

import { isJSDOM } from "../isJSDOM.ts";

/**
 * In jsdom, which has no `popover`, stands it in for the tests of the
 * `describe` block it is called in, so that a Popover shows and hides:
 * `showPopover()` and `hidePopover()` mark the element and display it,
 * `matches()` answers `:popover-open` from the mark, and nothing animates. Does nothing in a
 * browser.
 */
export function stubPopover(): void {
  if (!isJSDOM) return;
  const html = HTMLElement.prototype as Partial<HTMLElement>;
  const element = Element.prototype as Partial<Element>;
  const matches = Element.prototype.matches;
  const shown = new WeakSet<Element>();
  beforeAll(() => {
    // jsdom hides `[popover]` in its own stylesheet, where `:popover-open`
    // never matches, so a shown one is displayed inline.
    html.showPopover = function (this: HTMLElement) {
      shown.add(this);
      this.style.display = "block";
    };
    html.hidePopover = function (this: HTMLElement) {
      shown.delete(this);
      this.style.removeProperty("display");
    };
    element.matches = function (this: Element, selectors: string): boolean {
      return selectors
        .split(",")
        .map((selector) => selector.trim())
        .some((selector) =>
          selector === ":popover-open"
            ? shown.has(this)
            : matches.call(this, selector),
        );
    } as Element["matches"];
    element.getAnimations = () => [];
  });
  afterAll(() => {
    delete html.showPopover;
    delete html.hidePopover;
    element.matches = matches;
    delete element.getAnimations;
  });
}
