import { beforeAll } from "vitest";

import { stubPopover } from "../popover/stubPopover.ts";

/**
 * In jsdom, stands in `popover` (`stubPopover`) and `scrollIntoView`, which
 * list navigation calls as the keys move, for the tests of the `describe`
 * block it is called in. Does nothing in a browser.
 */
export function stubMenu(): void {
  stubPopover();
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => {};
  });
}
