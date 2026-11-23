/**
 * Why a popup opened or closed, the `reason` of `onOpenChange`'s details
 * (PLAN.md section 8, "API conventions"). Later components add reasons;
 * they do not rename these.
 *
 * - `escape-key`: Escape.
 * - `outside-press`: a press outside the popup, on a dialog's backdrop or
 *   in a popover's light dismiss.
 * - `trigger-press`: the trigger, pressed by pointer or keyboard, or a
 *   Context Menu's area by its `contextmenu` event.
 * - `close-request`: the browser closed the popup for another reason, such
 *   as the back gesture on Android, a `<form method="dialog">` or another
 *   popover opening.
 * - `trigger-hover`: the pointer rested on the trigger, or left the trigger
 *   and the popup (`floating/hover`).
 * - `close-press`: the popup's own close button, pressed by pointer or
 *   keyboard (Dialog's `Close`).
 * - `trigger-focus`: the trigger received keyboard focus, or lost it
 *   (Tooltip).
 * - `focus-out`: focus moved to an element outside the component, such as
 *   Tab out of a Navigation Menu's `<nav>`.
 * - `link-press`: a link inside the component was activated, by pointer or
 *   keyboard, such as a Navigation Menu's `Link`.
 * - `item-press`: an item of a menu was activated, by pointer or keyboard,
 *   which closes every open menu (Menu).
 * - `arrow-key`: an arrow key opened or closed a submenu, or a key that
 *   moves through a menu closed its open submenu (Menu); an arrow key
 *   opened or closed a combobox's list (Combobox).
 * - `input-change`: the user typed in a combobox's input, which opened its
 *   list (Combobox).
 * - `enter-key`: Enter closed a combobox's list with no item active
 *   (Combobox).
 */
export type OpenChangeReason =
  | "escape-key"
  | "outside-press"
  | "trigger-press"
  | "close-request"
  | "trigger-hover"
  | "close-press"
  | "trigger-focus"
  | "focus-out"
  | "link-press"
  | "item-press"
  | "arrow-key"
  | "input-change"
  | "enter-key";

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
