import { createSignal } from "solid-js";

export default function UnreadCount() {
  const [unread, setUnread] = createSignal(2);
  return (
    <div class="flex items-center gap-3 text-sm font-medium">
      Inbox
      {/* Rendered from the start, at zero too: a status that is added
          together with its text is not announced. */}
      <span
        role="status"
        class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground tabular-nums"
      >
        {unread()}
        <span class="sr-only"> unread messages</span>
      </span>
      <button
        type="button"
        onClick={() => setUnread((count) => count + 1)}
        class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
      >
        Receive a message
      </button>
    </div>
  );
}
