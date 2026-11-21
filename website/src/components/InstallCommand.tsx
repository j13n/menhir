import { createEffect, createSignal } from "solid-js";

/** How long "Copied" stays after a copy. */
const CONFIRM_MS = 2000;

/** A shell command with a button that copies it. */
export default function InstallCommand(props: { command: string }) {
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
    <div class="inline-flex items-center gap-3 rounded-lg bg-stone-200/70 py-2 pr-2 pl-4 font-mono text-sm dark:bg-stone-800/70">
      <code>{props.command}</code>
      <button
        type="button"
        aria-label="Copy install command"
        class="rounded px-2 py-1 font-sans text-xs text-stone-600 hover:bg-stone-300/70 dark:text-stone-300 dark:hover:bg-stone-700"
        onClick={async () => {
          await navigator.clipboard.writeText(props.command);
          setCopied(true);
        }}
      >
        {copied() ? "Copied" : "Copy"}
      </button>
      <span role="status" class="sr-only">
        {copied() ? "Copied" : ""}
      </span>
    </div>
  );
}
