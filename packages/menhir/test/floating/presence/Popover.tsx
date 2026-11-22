// A test popover for createPresence: a trigger with `popovertarget` and a
// `popover="auto"` element with `data-open` and `data-closed`, through
// createControllableSignal. createPresence shows and hides it, and the state
// follows the browser on `toggle`, as Popover (#33) will with dismissal.
import { createUniqueId } from "solid-js";

import { createControllableSignal } from "../../../src/core/createControllableSignal.ts";
import { createPresence } from "../../../src/floating/presence/presence.ts";

export interface PopoverProps {
  open?: boolean;
  class?: string;
}

export function Popover(props: PopoverProps) {
  const id = createUniqueId();
  let popup: HTMLDivElement | undefined;
  const [open, setOpen] = createControllableSignal({
    get value() {
      return props.open;
    },
    defaultValue: false,
  });
  createPresence({
    get popup() {
      return popup;
    },
    get open() {
      return open();
    },
  });
  return (
    <>
      <button type="button" popovertarget={id}>
        Popover trigger
      </button>
      <div
        ref={(el) => (popup = el)}
        id={id}
        popover="auto"
        aria-label="Popover"
        data-testid="Popover"
        class={props.class}
        data-open={open() ? "" : undefined}
        data-closed={open() ? undefined : ""}
        onToggle={(event) =>
          setOpen((event as ToggleEvent).newState === "open")
        }
      >
        <button type="button" onClick={() => setOpen(false)}>
          Close Popover
        </button>
      </div>
    </>
  );
}
