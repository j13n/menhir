/** An element that can take focus. */
export type FocusableElement = HTMLElement | SVGElement;

/**
 * The tab stops inside `root`, in the order Tab visits them. Framework-free;
 * reads layout, so call it in the browser, not on the server.
 *
 * A stop is an element whose `tabIndex` is 0 or more, or a `contenteditable`
 * editing host with no `tabindex`, that is not `:disabled`, is visible and
 * is not in an `inert` subtree. A radio group is one stop: its checked
 * radio, else its first. An open shadow root is searched in place of its
 * host's children, and a slot by what is assigned to it, else its fallback.
 * Positive `tabindex` values come first, in ascending order.
 */
export function tabStops(root: Element): FocusableElement[] {
  const found: FocusableElement[] = [];
  const search = (parent: Element) => {
    const assigned =
      parent instanceof HTMLSlotElement ? parent.assignedElements() : [];
    for (const element of parent.shadowRoot?.children ??
      (assigned.length ? assigned : parent.children)) {
      // Nothing inside an inert element can take focus.
      if (element.hasAttribute("inert")) continue;
      if (isStop(element)) addStop(found, element);
      search(element);
    }
  };
  search(root);
  // A stable sort: equal values keep tree order.
  return found.sort((a, b) => order(a) - order(b));
}

/** Whether Tab stops at `element`, leaving radio groups aside. */
function isStop(element: Element): element is FocusableElement {
  const { tabIndex, isContentEditable } = element as HTMLElement;
  return (
    (tabIndex >= 0
      ? // Reported as 0, but a link without href takes no focus.
        element.localName !== "a" || element.hasAttribute("href")
      : // The editing host, not the editable elements inside it.
        isContentEditable &&
        !element.parentElement?.isContentEditable &&
        !element.hasAttribute("tabindex")) &&
    !element.matches(":disabled") &&
    element.checkVisibility({ visibilityProperty: true })
  );
}

/** Adds a stop, keeping one radio per group: the checked one, else the first. */
function addStop(found: FocusableElement[], element: FocusableElement) {
  const index = found.findIndex((stop) => isSameStop(stop, element));
  if (index < 0) found.push(element);
  else if ((element as HTMLInputElement).checked) found[index] = element;
}

/** Whether `a` and `b` are one tab stop: the same element, or one radio group. */
export function isSameStop(a: Element | null, b: Element): boolean {
  return (
    a === b ||
    (isGroupedRadio(a) &&
      isGroupedRadio(b) &&
      a.name === b.name &&
      a.form === b.form)
  );
}

function isGroupedRadio(element: Element | null): element is HTMLInputElement {
  return (
    element instanceof HTMLInputElement &&
    element.type === "radio" &&
    element.name !== ""
  );
}

/** Above any positive `tabindex`, for the stops in tree order. */
const IN_TREE_ORDER = 2 ** 31;

/** Positive `tabindex` values first, then the rest. */
function order(element: FocusableElement): number {
  return element.tabIndex > 0 ? element.tabIndex : IN_TREE_ORDER;
}
