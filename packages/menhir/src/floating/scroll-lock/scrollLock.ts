import { createEffect, onCleanup } from "solid-js";

// The popups holding a lock, and what puts the page's own styles back once
// none does. Written only from effects, which do not run on the server.
let locks = 0;
let restoreStyles: (() => void) | undefined;

/**
 * Keeps the page from scrolling while a modal popup is open: `overflow:
 * hidden` on `<html>`, as `showModal()` leaves the page scrolling.
 *
 * ```ts
 * createScrollLock({
 *   get popup() { return dialog; },
 *   get open() { return open(); },
 * });
 * ```
 *
 * Counted, so nested popups unlock the page when the last one closes. A
 * page with a scrollbar gets its width as padding on `<html>`, so nothing
 * moves, and as `--hidden-scrollbar-width` for `position: fixed` elements;
 * a page with `scrollbar-gutter: stable` gets neither. Unlocking puts back
 * the page's own inline styles. The page unlocks once the popup has
 * closed, not when its state turns false: after the flush that closed it,
 * or on its `close` or `toggle` event if it is still shown then, as while
 * an exit animation runs. A popup disposed while open unlocks it at once.
 * While open, the popup gets `overscroll-behavior: contain` and, if it
 * does not scroll itself, `touch-action: pinch-zoom`, without which iOS
 * Safari scrolls the page from a drag on it or on its backdrop.
 */
export function createScrollLock(options: {
  readonly popup: HTMLElement | undefined;
  readonly open: boolean;
}): void {
  // What ends this popup's lock while it holds one, and what ends the wait
  // for it to close, while it is still shown after its state turned false.
  let held: (() => void) | undefined;
  let stopWaiting: (() => void) | undefined;
  const release = () => {
    stopWaiting?.();
    held?.();
    held = undefined;
  };
  // Disposal releases at once, before the check queued below runs.
  onCleanup(release);
  createEffect(
    () => options.open,
    (open) => {
      const popup = options.popup;
      if (!open || !popup) return;
      // Opened again before the last closing finished: it keeps its lock.
      stopWaiting?.();
      if (!held) {
        lock();
        const unlockTouch = lockTouch(popup);
        held = () => {
          unlockTouch();
          unlock();
        };
      }
      return () => {
        // After the popup's own close in this flush, whichever effect runs
        // first. A microtask, not `onFlush`, which is for event handlers:
        // this runs inside the flush.
        queueMicrotask(() => {
          if (!held || stopWaiting) return;
          if (!popup.matches("[open], :popover-open")) return release();
          const closed = (event: Event) => {
            if ((event as ToggleEvent).newState !== "open") release();
          };
          stopWaiting = () => {
            stopWaiting = undefined;
            popup.removeEventListener("close", closed);
            popup.removeEventListener("toggle", closed);
          };
          popup.addEventListener("close", closed);
          popup.addEventListener("toggle", closed);
        });
      };
    },
  );
}

function lock() {
  if (locks++) return;
  const html = document.documentElement;
  const style = html.style;
  const lockStyles: Record<string, string> = {
    "overflow-x": "hidden",
    "overflow-y": "hidden",
  };
  // The page's scrollbar, which `overflow: hidden` takes away. A stable
  // gutter stays, so nothing moves.
  const scrollbarWidth = innerWidth - html.clientWidth;
  const computed = getComputedStyle(html);
  if (
    scrollbarWidth > 0 &&
    !computed.getPropertyValue("scrollbar-gutter").startsWith("stable")
  ) {
    lockStyles["padding-right"] =
      `${parseFloat(computed.paddingRight) + scrollbarWidth}px`;
    lockStyles["--hidden-scrollbar-width"] = `${scrollbarWidth}px`;
  }
  restoreStyles = saveStyles(style, Object.keys(lockStyles));
  for (const name in lockStyles) style.setProperty(name, lockStyles[name]!);
}

function unlock() {
  if (!--locks) restoreStyles!();
}

/**
 * What keeps iOS Safari from scrolling the page through the popup, whatever
 * the page's `overflow`: `overscroll-behavior: contain`, so a popup that
 * scrolls stops at its end, and `touch-action: pinch-zoom` on a popup that
 * does not scroll itself, so that a drag on it, or on its backdrop, which
 * hits the popup, pans nothing. Checked again as the popup or its content
 * changes size. A popup that scrolls keeps its own `touch-action`, since
 * Chromium would no longer scroll it by touch.
 */
function lockTouch(popup: HTMLElement): () => void {
  const style = popup.style;
  const restoreContain = saveStyles(style, ["overscroll-behavior"]);
  const restoreTouch = saveStyles(style, ["touch-action"]);
  style.setProperty("overscroll-behavior", "contain");
  const observer = new ResizeObserver(() => {
    for (const child of popup.children) observer.observe(child);
    if (
      popup.scrollHeight > popup.clientHeight ||
      popup.scrollWidth > popup.clientWidth
    )
      restoreTouch();
    else style.setProperty("touch-action", "pinch-zoom");
  });
  observer.observe(popup);
  return () => {
    observer.disconnect();
    restoreTouch();
    restoreContain();
  };
}

/** Saves the inline values of `names`, and returns what puts them back. */
function saveStyles(style: CSSStyleDeclaration, names: string[]): () => void {
  const saved = names.map(
    (name) =>
      [
        name,
        style.getPropertyValue(name),
        style.getPropertyPriority(name),
      ] as const,
  );
  return () => {
    for (const [name, value, priority] of saved) {
      if (value) style.setProperty(name, value, priority);
      else style.removeProperty(name);
    }
  };
}
