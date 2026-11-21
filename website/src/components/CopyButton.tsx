import { createEffect, createSignal } from "solid-js";

/** How long "Copied" stays after a copy. */
const CONFIRM_MS = 2000;

export type CopyButtonProps = {
  /** Returns the text to copy, read when the button is pressed. */
  getText: () => string;
  /** The button's text until it copies; "Copied" replaces it for a moment. */
  label: string;
  /** The accessible name, when the label alone does not say what is copied. */
  "aria-label"?: string;
  title?: string;
  class?: string;
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

  return (
    <>
      <button
        type="button"
        aria-label={props["aria-label"]}
        title={props.title}
        class={props.class}
        onClick={async () => {
          await navigator.clipboard.writeText(props.getText());
          setCopied(true);
        }}
      >
        {copied() ? "Copied" : props.label}
      </button>
      <span role="status" class="sr-only">
        {copied() ? "Copied" : ""}
      </span>
    </>
  );
}
