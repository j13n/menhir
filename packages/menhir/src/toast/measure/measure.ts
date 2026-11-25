/**
 * The heights a stylesheet needs to collapse the toasts into a stack and
 * expand them again, as a ref for `Toast.Region`:
 *
 * ```tsx
 * <Toast.Region ref={Toast.measure()}>
 * ```
 *
 * Each toast, a child element of the Region, gets its height in
 * `--toast-height` and the heights of the newer toasts added up in
 * `--toast-offset`, in pixels, kept as toasts come, change size and leave.
 * A toast that has closed adds nothing, so those behind it move up while
 * its exit animation runs. Gaps are the stylesheet's:
 * `calc(var(--toast-offset) + var(--toast-index) * 8px)`. An app that does
 * not import it bundles none of it.
 */
export function measure() {
  return (region: HTMLElement) => {
    const write = () => {
      // The newest is last in the document.
      const toasts = [...region.children].reverse() as HTMLElement[];
      // Every height is read before any is written: one layout, not one
      // per toast.
      const heights = toasts.map((toast) => toast.offsetHeight);
      let offset = 0;
      toasts.forEach((toast, index) => {
        toast.style.setProperty("--toast-height", `${heights[index]}px`);
        toast.style.setProperty("--toast-offset", `${offset}px`);
        if (!toast.hasAttribute("data-closed")) offset += heights[index]!;
      });
    };
    const sizes = new ResizeObserver(write);
    const watch = () => {
      sizes.disconnect();
      for (const toast of region.children) sizes.observe(toast);
      write();
    };
    // Neither observer is disconnected: a ref has no cleanup, and both go
    // with the Region's element, the only thing they hold.
    const toasts = new MutationObserver(watch);
    toasts.observe(region, {
      childList: true,
      subtree: true,
      attributeFilter: ["data-closed"],
    });
    watch();
  };
}
