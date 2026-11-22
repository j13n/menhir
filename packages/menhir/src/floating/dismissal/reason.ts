/**
 * Why a popup opened or closed, the `reason` of `onOpenChange`'s details
 * (PLAN.md section 8, "API conventions"). Later components add reasons;
 * they do not rename these.
 *
 * - `escape-key`: Escape.
 * - `outside-press`: a press outside the popup, on a dialog's backdrop or
 *   in a popover's light dismiss.
 * - `trigger-press`: the trigger, pressed by pointer or keyboard.
 * - `close-request`: the browser closed the popup for another reason, such
 *   as the back gesture on Android, a `<form method="dialog">` or another
 *   popover opening.
 */
export type OpenChangeReason =
  "escape-key" | "outside-press" | "trigger-press" | "close-request";

/**
 * The second argument of `onOpenChange`. `event` is the event that caused
 * the change: the key or pointer event when there was one, else the
 * browser's own `cancel`, `close` or `beforetoggle`. There is no `cancel()`:
 * a consumer keeps a popup open by controlling `open`.
 */
export interface OpenChangeDetails {
  readonly reason: OpenChangeReason;
  readonly event: Event;
}
