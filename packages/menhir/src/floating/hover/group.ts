/** A popup of a group, as `createHover` registers it. */
export interface HoverGroupMember {
  /** Closes the popup, because another member opened on `event`. */
  close(event: Event): void;
}

/** Triggers whose popups open without a delay once one of them is open. */
export interface HoverGroup {
  /**
   * The delay before a member opens, given its own `delay`: 0 while the
   * group is open, else its own, or the group's.
   */
  delay(own: number | undefined): number | undefined;
  /** `member` opened on hover: the member that was open closes. */
  opened(member: HoverGroupMember, event: Event): void;
  /** `member` closed, for any reason. */
  closed(member: HoverGroupMember): void;
}

/**
 * A group of hover popups, such as the tooltips of a toolbar: once one is
 * open, hovering another opens it at once and closes the first. Created by
 * the part that groups triggers, provided through its context, and passed
 * to each popup's `createHover` as `group`:
 *
 * ```ts
 * const group = createHoverGroup({
 *   get delay() { return props.delay; },
 *   get timeout() { return props.timeout; },
 * });
 * ```
 *
 * The next member still opens at once within `timeout` milliseconds
 * (default 400) of the last one closing. `delay` is the delay of members
 * that set none. Only popups opened by hover count. It keeps the time of
 * the last closing, not a timer, so it has nothing to clear.
 */
export function createHoverGroup(
  options: { readonly delay?: number; readonly timeout?: number } = {},
): HoverGroup {
  let current: HoverGroupMember | undefined;
  let closedAt = -Infinity;
  return {
    delay: (own) =>
      current || Date.now() - closedAt < (options.timeout ?? 400)
        ? 0
        : (own ?? options.delay),
    opened(member, event) {
      if (current !== member) current?.close(event);
      current = member;
    },
    closed(member) {
      if (current !== member) return;
      current = undefined;
      closedAt = Date.now();
    },
  };
}
