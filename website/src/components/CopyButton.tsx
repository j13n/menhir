import type { JSX } from "@solidjs/web";
import { createEffect, createSignal, untrack } from "solid-js";

/** How long "Copied" stays after a copy. */
const CONFIRM_MS = 2000;

/** The props CopyButton gives its button. */
type CopyButtonElementProps = Pick<
  JSX.HTMLAttributes<HTMLElement>,
  "aria-label" | "class" | "onClick" | "children"
>;

export type CopyButtonProps = {
  /** Returns the text to copy, read when the button is pressed. */
  getText: () => string;
  /** The button's text until it copies; "Copied" replaces it for a moment. */
  label: string;
  /** The accessible name, when the label alone does not say what is copied. */
  "aria-label"?: string;
  class?: string;
  /**
   * Renders the button from its props, such as a `Tooltip.Trigger` that
   * spreads them; a `<button>` by default.
   */
  render?: (props: CopyButtonElementProps) => JSX.Element;
};

/** A button that copies text and says "Copied", visibly and to screen readers. */
export default function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = createSignal(false);

  createEffect(
    () => copied(),
    (isCopied) => {
      if (!isCopied) return;
      const id = setTimeout(() => setCopied(false), CONFIRM_MS);
      return () => clearTimeout(id);
    },
  );

  const copy = async () => {
    await navigator.clipboard.writeText(props.getText());
    setCopied(true);
  };
  // Read once, as a part's `render` is.
  const Button =
    untrack(() => props.render) ??
    ((p: CopyButtonElementProps) => <button type="button" {...p} />);

  return (
    <>
      <Button
        aria-label={props["aria-label"]}
        class={props.class}
        onClick={copy}
      >
        {copied() ? "Copied" : props.label}
      </Button>
      <span role="status" class="sr-only">
        {copied() ? "Copied" : ""}
      </span>
    </>
  );
}
