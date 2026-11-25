// Rendered on the server and hydrated in the test, so both sides get the
// same tree. The list is made by the module and a toast is added as it
// loads, as an app's module might: on the server `add()` adds nothing, so
// the server HTML holds the Region alone, and the client module's toast is
// removed before hydration by the test (README, "Decisions").
import { createToastManager, Toast } from "../../src/toast/index.ts";

export const toasts = createToastManager();

toasts.add({ id: "early", title: "Added by the module", duration: Infinity });

export default function ToastFixture() {
  return (
    <Toast.Provider manager={toasts}>
      <button type="button">Page</button>
      <Toast.Region aria-label="Notifications">
        {(toast) => (
          <Toast.Root toast={toast} data-testid={toast.id}>
            <Toast.Title />
            <Toast.Close aria-label="Close" />
          </Toast.Root>
        )}
      </Toast.Region>
    </Toast.Provider>
  );
}
