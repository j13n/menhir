import CopyButton from "./CopyButton";

/** A shell command with a button that copies it. */
export default function InstallCommand(props: { command: string }) {
  return (
    <div class="inline-flex items-center gap-3 rounded-lg bg-stone-200/70 py-2 pr-2 pl-4 font-mono text-sm dark:bg-stone-800/70">
      <code>{props.command}</code>
      <CopyButton
        getText={() => props.command}
        label="Copy"
        aria-label="Copy install command"
        class="rounded px-2 py-1 font-sans text-xs text-stone-600 hover:bg-stone-300/70 dark:text-stone-300 dark:hover:bg-stone-700"
      />
    </div>
  );
}
