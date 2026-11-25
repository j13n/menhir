/**
 * Calls `done` once the animations and transitions running in `element`,
 * its descendants and its pseudo-elements have settled, or at once when
 * none is running: the wait of an exit that CSS animates from an attribute
 * such as `data-closed`. Infinite and paused ones do not count, a cancelled
 * one settles too, and one that started meanwhile is waited for as well.
 * Returns what cancels the wait, after which `done` is not called.
 */
export function afterExit(element: Element, done: () => void): () => void {
  let cancelled = false;
  const wait = () => {
    if (cancelled) return;
    const running = element
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation.playState === "running" &&
          animation.effect?.getComputedTiming().endTime !== Infinity,
      );
    if (running.length) {
      void Promise.allSettled(
        running.map((animation) => animation.finished),
      ).then(wait);
      return;
    }
    done();
  };
  wait();
  return () => {
    cancelled = true;
  };
}
