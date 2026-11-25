import { onSettled } from "solid-js";

// The answers to the resets under way, run together in one task, in the
// order the parts listened: a part's `onFlush` then runs after those of the
// parts before it, as when each answered during the event.
let answers: (() => void)[] | undefined;

/**
 * A form reset puts a native control back to its default, and so it does a
 * part: `reset` asks for the part's default, through its setters, so that a
 * controlled part asks. Listens to `form()`, read once the part has settled.
 *
 * ```ts
 * onFormReset(
 *   () => input?.form,
 *   () => {
 *     setChecked(props.defaultChecked ?? false);
 *     onFlush(sync);
 *   },
 *   () => {
 *     input!.defaultChecked = input!.checked;
 *   },
 * );
 * ```
 *
 * - `hold` runs during the event, before the browser resets the controls,
 *   and what it returns is `reset`'s second argument. A part whose state
 *   is its own, not the element's, makes each element's state there the
 *   attribute the browser resets it to (`defaultChecked`, `defaultValue`),
 *   so the reset leaves it as it is: it never shows a state the part does
 *   not hold, and a binding that re-runs before `reset`, such as a Field's
 *   `data-touched` as the touched state clears, does not write its value
 *   back over the reset element (`UNCOMMITTED_INPUT_OVERWRITTEN`). Each
 *   part writes its own, a line, so no part pays for another's.
 * - `reset` runs in a task after the event, not in `onFlush`: when the user
 *   presses a reset button, the browser runs microtasks as each listener
 *   returns, before it resets the controls and before later listeners
 *   could cancel the reset (src/input/README.md, "A form reset asks").
 *   Every part's `reset` runs in the same task, in the order the parts
 *   listened, so a set equal to one made before it in the task
 *   does nothing (`createControllableSignal`), and a Field, which listens
 *   before the controls inside it, reads them in an `onFlush` after theirs.
 * - A reset the app cancels asks for nothing: the reset is the event's
 *   default action, so its `defaultPrevented` is the app saying no.
 * - A part the reset removes before the task, such as a row of a list
 *   going back to its default length, asks for nothing, so it does not
 *   write its row back.
 */
export function onFormReset<T = void>(
  form: () => HTMLFormElement | null | undefined,
  reset: (event: Event, held: T) => void,
  hold?: () => T,
): void {
  onSettled(() => {
    const target = form();
    if (!target) return;
    let disposed = false;
    const onReset = (event: Event) => {
      const held = hold?.() as T;
      if (!answers) {
        const queue: (() => void)[] = (answers = []);
        setTimeout(() => {
          answers = undefined;
          for (const answer of queue) answer();
        });
      }
      answers.push(() => {
        if (!disposed && !event.defaultPrevented) reset(event, held);
      });
    };
    target.addEventListener("reset", onReset);
    return () => {
      disposed = true;
      target.removeEventListener("reset", onReset);
    };
  });
}
