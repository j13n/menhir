import { createToastManager, Toast } from "menhir/toast";

import "./toast.css";

// Made once, where the code that adds toasts can import it.
const toasts = createToastManager();

let saved = 0;

export default function ToastExample() {
  return (
    <Toast.Provider manager={toasts}>
      <div class="toast-buttons">
        <button
          type="button"
          class="toast-button"
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
          class="toast-button"
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
      <Toast.Region aria-label="Notifications" class="toast-region">
        {(toast) => (
          <Toast.Root
            toast={toast}
            class="toast"
            ref={Toast.swipe({ direction: "right" })}
          >
            <Toast.Title class="toast-title" />
            <Toast.Description class="toast-description" />
            <Toast.Close class="toast-close" aria-label="Close">
              ×
            </Toast.Close>
          </Toast.Root>
        )}
      </Toast.Region>
    </Toast.Provider>
  );
}
