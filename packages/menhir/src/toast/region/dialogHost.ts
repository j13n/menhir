/**
 * Keeps a `popover="manual"` element usable above modal dialogs: shows it,
 * and while a modal `<dialog>` is open, moves it into the one opened last,
 * since a modal dialog makes every node outside it inert and is painted
 * above what was in the top layer before it. When that dialog closes, or
 * leaves the document, the element goes to the dialog opened before it,
 * else back to its place. The browser hides a popover that moves, so it is
 * shown again after each move (README, "Decisions").
 *
 * `showModal()` fires no event that is Widely available, so a
 * `MutationObserver` watches the document's `open` attributes. `moved` is
 * called after each move. Returns what stops it and puts the element back.
 */
export function hostInDialog(
  element: HTMLElement,
  // Called after each move: an element that moves gets no `pointerleave`
  // and no `focusout`.
  moved: () => void,
): () => void {
  // The element's place in the page: a comment node holds it meanwhile.
  const home = document.createComment("");
  // The open modal dialogs, in the order they opened.
  let dialogs: HTMLDialogElement[] = [];
  const isModal = (dialog: HTMLDialogElement) =>
    dialog.isConnected && dialog.matches(":modal");

  const place = () => {
    dialogs = dialogs.filter(isModal);
    const host = dialogs[dialogs.length - 1];
    if (host) {
      if (element.parentNode !== host) {
        if (!home.parentNode) element.before(home);
        host.append(element);
        moved();
      }
    } else if (home.parentNode) {
      home.replaceWith(element);
      moved();
    }
    if (element.isConnected && !element.matches(":popover-open"))
      element.showPopover();
  };

  const observer = new MutationObserver((records) => {
    for (const { target } of records) {
      if (
        target instanceof HTMLDialogElement &&
        !dialogs.includes(target) &&
        isModal(target)
      )
        dialogs.push(target);
    }
    place();
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });
  // Those open already, in document order: the best guess at their order.
  dialogs = [...document.querySelectorAll<HTMLDialogElement>("dialog[open]")];
  place();

  return () => {
    observer.disconnect();
    if (home.parentNode) home.replaceWith(element);
  };
}
