import type { JSX } from "@solidjs/web";
import {
  createMemo,
  createSignal,
  omit,
  onFlush,
  onSettled,
  untrack,
} from "solid-js";

import { FormContext } from "../core/formContext.ts";
import type { FormContextValue, FormErrors } from "../core/formContext.ts";
import { onFormReset } from "../core/formReset.ts";
import { callHandler, mergeElementProps } from "../core/mergeElementProps.ts";
import type { Handler } from "../core/mergeElementProps.ts";
import { renderElement } from "../core/renderElement.tsx";
import type { ElementProps, RenderProp } from "../core/renderElement.tsx";

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Errors keyed by a Field's `name`, such as a server's answer to a
   * submission or a schema's issues (`issuesToErrors`). Each shows in its
   * Field at once, and hides once its control is edited, until the next
   * `errors` object.
   */
  errors?: FormErrors;
  render?: RenderProp;
}

/** A control the browser validates. */
type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * A `<form>` that hands `errors` to the Fields inside it by `name`, and
 * blocks a submission while a control is invalid, focusing the first one.
 * It holds no values: they stay in the controls, or in the app's state.
 * `onSubmit` is called only for a submission that is not blocked.
 */
export function Form(props: FormProps) {
  // The names whose error is hidden, or `true` for all of them after a
  // reset. Derived from `errors`, so each new object shows every error
  // again.
  // Held in a memo: `errors={{ email: message() }}` is a prop getter that
  // makes a new object on each read, and is the same errors until
  // `message()` changes.
  const errors = createMemo(() => props.errors);
  const [hidden, setHidden] = createSignal<ReadonlySet<string> | true>(() => {
    void errors();
    return new Set<string>();
  });
  const context: FormContextValue = {
    error(name) {
      const current = errors();
      const names = hidden();
      return current &&
        names !== true &&
        !names.has(name) &&
        Object.hasOwn(current, name)
        ? current[name]
        : undefined;
    },
  };

  // Hides errors once the event's flush has run, as Field writes its own
  // state, and only the `errors` the event met: a new object passed in the
  // same update is the answer to a later submission.
  const hide = (
    update: (names: ReadonlySet<string>) => ReadonlySet<string> | true,
    met = untrack(errors),
  ) =>
    onFlush(() => {
      if (untrack(errors) === met) {
        setHidden((names) => (names === true ? names : update(names)));
      }
    });
  // An edit makes the error of that control's name stale.
  const hideError = (event: Event) => {
    const name = (event.target as Partial<Validatable>).name;
    if (name) hide((names) => new Set(names).add(name));
  };

  let form: HTMLFormElement | undefined;
  // Not in the server HTML, so the browser validates a submission made
  // before hydration itself.
  onSettled(() => {
    if (form) form.noValidate = true;
  });
  // A reset hides every error, unless the app cancels it: in a task after
  // the event, with the errors the event met (`onFormReset`).
  onFormReset(
    () => form,
    (_, met) => hide(() => true, met),
    () => untrack(errors),
  );

  const ownProps = {
    onInput: hideError,
    onChange: hideError,
    onSubmit: (event: SubmitEvent) => {
      const submitter = event.submitter as HTMLButtonElement | null;
      // `checkValidity()` fires `invalid` at each invalid control, which
      // touches its Field, and shows nothing.
      if (!submitter?.formNoValidate && !form!.checkValidity()) {
        event.preventDefault();
        // The first invalid control in tree order. A Menhir control's
        // hidden input hands focus to its button.
        (Array.from(form!.elements) as Validatable[])
          .find((control) => control.willValidate && !control.validity.valid)
          ?.focus();
        return;
      }
      callHandler(props.onSubmit as Handler | undefined, event);
    },
    ref: (element: HTMLElement) => {
      form = element as HTMLFormElement;
    },
  } as ElementProps;
  // `onSubmit` is called by Form's own, only when not blocked.
  const consumerProps = omit(props, "render", "errors", "onSubmit");
  const elementProps = mergeElementProps(
    ownProps,
    consumerProps as JSX.HTMLAttributes<HTMLElement>,
  );
  return (
    <FormContext value={context}>
      {renderElement(props, elementProps, (p) => (
        <form {...p} />
      ))}
    </FormContext>
  );
}
