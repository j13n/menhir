import type { JSX } from "@solidjs/web";
import {
  createSignal,
  createUniqueId,
  merge,
  omit,
  onFlush,
  onSettled,
  useContext,
} from "solid-js";

import { FormContext } from "../../core/formContext.ts";
import { mergeElementProps } from "../../core/mergeElementProps.ts";
import type { ElementProps } from "../../core/renderElement.tsx";
import { renderElement } from "../../core/renderElement.tsx";
import type { RenderProp } from "../../core/renderElement.tsx";
import { FieldRootContext } from "./FieldRootContext.ts";
import type {
  FieldErrorEntry,
  FieldRootContextValue,
  FieldStateAttributes,
} from "./FieldRootContext.ts";

export interface FieldRootProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The control's `name`, which the form submits it under. */
  name?: string;
  /** Whether the control is disabled. Every part gets `data-disabled`. */
  disabled?: boolean;
  /**
   * Whether the field is invalid, from outside: a schema, a server's
   * answer, the app's own form state. Shown once the field is touched.
   */
  invalid?: boolean;
  /**
   * The error message from outside, which makes the field invalid. An Error
   * without children shows it, over the browser's message.
   */
  error?: string;
  render?: RenderProp;
}

/** A control the browser validates. */
type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const controlSelector = "input,select,textarea";

/**
 * The field: a `<div>` that holds a control's label, description and error,
 * and its validity. It generates the control's `id` and the Description's,
 * and tracks whether the field was touched.
 */
export function FieldRoot(props: FieldRootProps) {
  const controlId = createUniqueId();
  const descriptionId = createUniqueId();
  const [touched, setTouched] = createSignal(false);
  // The first control inside the Root that the browser finds invalid. Set
  // again on each event, even to the same element, whose message may have
  // changed.
  const [invalidControl, setInvalidControl] = createSignal<
    Validatable | undefined
  >(undefined, { equals: false });
  // False in the server HTML and the first render, when the control names
  // the Description before it is rendered (README, "Decisions").
  const [settled, setSettled] = createSignal(false);
  const [descriptions, setDescriptions] = createSignal(0);
  const [errors, setErrors] = createSignal<FieldErrorEntry[]>([]);
  let root: HTMLElement | undefined;

  const readValidity = () => {
    if (!root) return undefined;
    for (const control of root.querySelectorAll<Validatable>(controlSelector)) {
      if (control.willValidate && !control.validity.valid) return control;
    }
    return undefined;
  };
  // Reads the controls' validity again, and sets touched if given. The
  // Field's own state is written after the event's flush, so async work the
  // event starts does not hold it (PLAN.md section 8, "API conventions").
  // By then a form reset has reset the controls too.
  const update = (touch?: boolean) =>
    onFlush(() => {
      setInvalidControl(readValidity());
      if (touch !== undefined) setTouched(touch);
    });

  // The error the Form around the Root hands it by `name`, the answer to a
  // submission, which shows touched or not (src/form/README.md).
  const form = useContext(FormContext);
  const formError = () =>
    props.name === undefined ? undefined : form?.error(props.name);

  const invalid = () =>
    !!props.invalid || !!props.error || invalidControl() !== undefined;
  const showsError = () => (touched() && invalid()) || !!formError();

  const attributes: FieldStateAttributes = {
    get "data-invalid"() {
      return showsError() ? "" : undefined;
    },
    get "data-touched"() {
      return touched() ? "" : undefined;
    },
    get "data-disabled"() {
      return props.disabled ? "" : undefined;
    },
  };

  const context: FieldRootContextValue = {
    controlId,
    descriptionId,
    name: () => props.name,
    disabled: () => props.disabled,
    showsError,
    // The Field's own error shows once touched; before, only the Form's.
    message: () =>
      (touched() && props.error) ||
      formError() ||
      invalidControl()?.validationMessage,
    validity: () => invalidControl()?.validity,
    describedBy() {
      const ids: string[] = [];
      if (!settled() || descriptions() > 0) ids.push(descriptionId);
      for (const error of errors()) {
        const id = error.shown() && error.id();
        if (id) ids.push(id);
      }
      return ids.join(" ") || undefined;
    },
    registerDescription() {
      setDescriptions((count) => count + 1);
      return () => setDescriptions((count) => count - 1);
    },
    registerError(entry) {
      setErrors((list) => [...list, entry]);
      return () => setErrors((list) => list.filter((e) => e !== entry));
    },
    attributes,
  };

  // A submission attempt, or a control found invalid: `invalid` does not
  // bubble, so the Root and the form listen in the capture phase.
  const touch = () => update(true);

  onSettled(() => {
    setSettled(true);
    // A submission attempt touches every Field of the form, by its submit
    // event or an `invalid` event of any control in it, and a reset clears
    // it.
    const form =
      root?.querySelector<Validatable>(controlSelector)?.form ??
      root?.closest("form");
    if (!form) return;
    // A reset the app cancels, after this listener, keeps it touched.
    const onReset = (event: Event) =>
      onFlush(() => {
        if (!event.defaultPrevented) update(false);
      });
    form.addEventListener("submit", touch);
    form.addEventListener("invalid", touch, true);
    form.addEventListener("reset", onReset);
    return () => {
      form.removeEventListener("submit", touch);
      form.removeEventListener("invalid", touch, true);
      form.removeEventListener("reset", onReset);
    };
  });

  const ownProps: ElementProps = merge(attributes, {
    onFocusOut: (event: FocusEvent) => {
      const to = event.relatedTarget as Node | null;
      // Focus moving to nothing while the control keeps it is the window
      // losing focus, to another window or tab, not the user leaving the
      // field; a press on the page moves focus to the body.
      const left = to
        ? !root?.contains(to)
        : document.activeElement !== event.target;
      update(left || undefined);
    },
    onChange: touch,
    onInput: () => update(),
    ref: (element: HTMLElement) => {
      root = element;
      element.addEventListener("invalid", touch, true);
    },
  });
  const elementProps = mergeElementProps(
    ownProps,
    omit(props, "render", "name", "disabled", "invalid", "error"),
  );
  return (
    <FieldRootContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <div {...p} />
      ))}
    </FieldRootContext>
  );
}
