import { Toast } from "@base-ui/react/toast";

function Buttons() {
  const toastManager = Toast.useToastManager();

  return (
    <div className="row">
      <button
        type="button"
        onClick={() =>
          toastManager.add({
            title: "Saved",
            description: "Your changes were saved.",
          })
        }
      >
        Show toast
      </button>
      <button
        type="button"
        onClick={() =>
          toastManager.add({
            title: "Failed",
            description: "Could not save.",
            type: "error",
            priority: "high",
          })
        }
      >
        Show error toast
      </button>
    </div>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} className="toast">
      <Toast.Content>
        <Toast.Title />
        <Toast.Description />
        <Toast.Close>Close</Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

export default function ToastDemo() {
  return (
    <Toast.Provider>
      <Buttons />
      <Toast.Portal>
        <Toast.Viewport className="toasts">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
