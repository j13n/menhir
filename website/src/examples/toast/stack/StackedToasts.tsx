import { createToastManager, Toast } from "menhir/toast";

import "./stack.css";

export const toasts = createToastManager();

export default function StackedToasts() {
  return (
    <Toast.Provider manager={toasts} limit={5}>
      <Toast.Region
        aria-label="Notifications"
        class="toast-region"
        ref={Toast.measure()}
      >
        {(toast) => (
          <Toast.Root toast={toast} class="toast">
            <Toast.Title />
            <Toast.Close aria-label="Close">×</Toast.Close>
          </Toast.Root>
        )}
      </Toast.Region>
    </Toast.Provider>
  );
}
