const unread = 3;

export default function MessagesButton() {
  return (
    <button type="button">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="size-4"
      >
        <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
      </svg>
      {/* The count is in the button's name, so the badge itself is hidden
          from a screen reader: it would only repeat the number. */}
      <span class="sr-only">Messages, {unread} unread</span>
      <span
        aria-hidden="true"
        class="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent bg-primary px-1 text-xs font-medium whitespace-nowrap text-primary-foreground tabular-nums"
      >
        {unread}
      </span>
    </button>
  );
}
