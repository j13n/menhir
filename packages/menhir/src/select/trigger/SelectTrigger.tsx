import { isDev } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createUniqueId, merge, omit, onFlush, untrack } from "solid-js";

import { warnUnlessButton } from "../../core/button.ts";
import type { ButtonElementProps } from "../../core/button.ts";
import { onFormReset } from "../../core/formReset.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { useSelectContext } from "../root/SelectContext.ts";

export interface SelectTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp;
}

/**
 * The button that shows the value and opens the list: a `<button
 * type="button" role="combobox" aria-haspopup="listbox">` with
 * `aria-expanded`, naming the Popup in `popovertarget` and `aria-controls`
 * and the active item in `aria-activedescendant`. It keeps focus while the
 * list is open and takes every key. A visually hidden `<input>` follows
 * it, the form's view of the value. Name it with a `<label>`. Place it
 * inside `Select.Root`, right before `Select.Popup`.
 */
export function SelectTrigger(props: SelectTriggerProps) {
  const select = useSelectContext();
  const { list } = select;
  const generated = createUniqueId();
  // The consumer's `id`, else the generated one, which labels the Popup
  // rendered after it. Kept out of the merge, where a wrapper's
  // `id={undefined}` would remove it ("`undefined` is a value", PLAN.md
  // section 8).
  const id = () => props.id ?? generated;
  select.triggerId = id;
  let input: HTMLInputElement | undefined;

  const press = (event: Event) => ({ reason: "trigger-press", event }) as const;
  // Opens the list on its first or last item, or, with no `edge`, on the
  // selected item, else the first. While closed, the move waits for the
  // list to open (list navigation).
  const openList = (event: KeyboardEvent, edge?: "first" | "last") => {
    select.setOpen(true, press(event));
    const items = list.items();
    if (edge) list.move(edge === "last" ? items[items.length - 1] : items[0]);
  };
  // Selects the active item, unless it is disabled, and closes the list.
  const selectActive = (
    event: KeyboardEvent,
    reason: "item-press" | "focus-out",
  ) => {
    if (select.select(select.active()) || reason === "focus-out")
      select.setOpen(false, { reason, event });
  };

  const ownProps = merge(select.attributes, {
    type: "button",
    role: "combobox",
    get id() {
      return id();
    },
    get disabled() {
      return select.props.disabled;
    },
    // So that the browser counts a press on the Trigger as one on the
    // popover, which light dismiss leaves open (`src/popover/README.md`).
    popovertarget: select.popupId,
    "aria-haspopup": "listbox",
    get "aria-expanded"() {
      return select.open() ? "true" : "false";
    },
    "aria-controls": select.popupId,
    // Only while open, as an item's `data-active`.
    get "aria-activedescendant"() {
      return select.open() ? select.active()?.id : undefined;
    },
    get "aria-required"() {
      return select.props.required ? "true" : undefined;
    },
    onClick: (event: MouseEvent) => {
      // The state shows and hides the popover, in the flush that places
      // it: the browser's own toggle would show it a task before.
      event.preventDefault();
      select.setOpen(!select.open(), press(event));
    },
    onKeyDown: (event: KeyboardEvent) => {
      const isOpen = select.open();
      // A typed character opens a closed Select on its match, and the
      // string goes on (PLAN.md section 8, "Typeahead").
      if (select.typeahead.onKeyDown(event)) {
        if (!isOpen) select.setOpen(true, press(event));
        return;
      }
      const { key, altKey } = event;
      if (event.ctrlKey || event.metaKey) return;
      if (key === "Tab") {
        // Focus moves on by itself.
        if (isOpen) selectActive(event, "focus-out");
        return;
      }
      if (event.shiftKey) return;
      const enterOrSpace = key === "Enter" || key === " ";
      if (!isOpen) {
        if (enterOrSpace || key === "ArrowDown") openList(event);
        else if (altKey) return;
        else if (key === "ArrowUp" || key === "Home") openList(event, "first");
        else if (key === "End") openList(event, "last");
        else return;
      } else if (enterOrSpace || (altKey && key === "ArrowUp")) {
        selectActive(event, "item-press");
      } else {
        // The keys move on from the item the list opened on.
        const active = select.active();
        if (!list.active()) list.move(active);
        if (key === "PageDown" || key === "PageUp") {
          const items = list.items();
          const index = items.indexOf(active!) + (key === "PageUp" ? -10 : 10);
          list.move(items[Math.min(Math.max(index, 0), items.length - 1)]);
        } else if (!list.onKeyDown(event)) return;
      }
      // Enter and Space would click the button, and toggle the list again.
      event.preventDefault();
    },
    ref: (element: HTMLElement) => {
      select.trigger = element;
      // Production builds drop the check with `isDev`.
      if (isDev) warnUnlessButton(element, "Select.Trigger");
    },
  } satisfies ButtonElementProps & { popovertarget: string });

  // Puts the input back to the Select's value, once that has settled: a
  // controlled Select's consumer may have declined the change.
  const syncInput = () => {
    if (input) input.value = untrack(select.value) ?? "";
  };
  // A selection, which the Select makes through the input, and a value the
  // browser fills in. The browser's is an item's `value`, or its label.
  const onInputChange = () => {
    const filled = input!.value;
    const items = list.items();
    const label = filled.toLowerCase();
    const item =
      items.find((item) => item.value === filled) ??
      items.find(
        (item) =>
          (item.text ?? item.element.textContent ?? "").trim().toLowerCase() ===
          label,
      );
    if (item) select.setValue(item.value);
    else if (!filled) select.setValue(null);
    onFlush(syncInput);
  };
  // A form reset puts a control back to its default, and so it does the
  // Select: through the setter, so that a controlled Select asks.
  onFormReset(
    () => input?.form,
    () => {
      select.setValue(select.props.defaultValue ?? null);
      onFlush(syncInput);
    },
    // Held through the browser's reset (`onFormReset`).
    () => {
      input!.defaultValue = input!.value;
    },
  );

  const elementProps = mergeElementProps(ownProps, omit(props, "render", "id"));
  return (
    <>
      {renderElement(props, elementProps, (p) => (
        <button {...p} />
      ))}
      <input
        aria-hidden="true"
        tabindex={-1}
        style={visuallyHidden}
        name={select.props.name}
        form={select.props.form}
        required={select.props.required}
        disabled={select.props.disabled}
        autocomplete={select.props.autocomplete}
        value={select.value() ?? ""}
        onChange={onInputChange}
        // The browser focuses an invalid input when it blocks a submission.
        // The user knows the Trigger, not the hidden input.
        onFocus={() => select.trigger?.focus()}
        ref={(element) => {
          input = element;
          select.input = element;
        }}
      />
    </>
  );
}

// Hidden from sight but not from the form. Not `display: none`, so the
// browser can still anchor a validation message to it.
const visuallyHidden =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none";
