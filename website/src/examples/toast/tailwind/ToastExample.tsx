import { createToastManager, Toast } from "menhir/toast";

// Made once, where the code that adds toasts can import it.
const toasts = createToastManager();

let saved = 0;

const button =
  "cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600";

export default function ToastExample() {
  return (
    <Toast.Provider manager={toasts}>
      <div class="flex gap-2">
        <button
          type="button"
          class={button}
          onClick={() =>
            toasts.add({
              title: "Saved",
              description: `Draft ${++saved} is stored.`,
            })
          }
        >
          Save draft
        </button>
        <button
          type="button"
          class={button}
          onClick={() =>
            toasts.add({
              title: "Connection lost",
              description: "Changes are kept on this device.",
              priority: "high",
              duration: Infinity,
            })
          }
        >
          Go offline
        </button>
      </div>
      {/* A popover lays out only once shown: `open:` is :popover-open. */}
      <Toast.Region
        aria-label="Notifications"
        class="fixed inset-auto right-4 bottom-4 m-0 w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 overflow-visible border-0 bg-transparent p-0 text-inherit open:flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-500"
      >
        {(toast) => (
          <Toast.Root
            toast={toast}
            ref={Toast.swipe({ direction: "right" })}
            class="relative translate-x-(--toast-swipe-x,0) rounded-lg border border-stone-200 bg-white py-3 pr-10 pl-4 text-sm shadow-lg transition-opacity duration-150 data-closed:opacity-0 data-[priority=high]:border-red-600 data-[swipe=move]:cursor-grabbing data-[swipe=move]:select-none dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
          >
            <Toast.Title class="font-semibold" />
            <Toast.Description class="mt-0.5 text-stone-500 dark:text-stone-400" />
            <Toast.Close
              aria-label="Close"
              class="absolute top-2 right-2 size-6 cursor-pointer rounded border-0 bg-transparent focus-visible:outline-2 focus-visible:outline-stone-500"
            >
              ×
            </Toast.Close>
          </Toast.Root>
        )}
      </Toast.Region>
    </Toast.Provider>
  );
}
