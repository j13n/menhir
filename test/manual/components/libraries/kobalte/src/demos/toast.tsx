import { Toast, toaster } from "@kobalte/core/toast";
import { Portal } from "solid-js/web";

// A toast's priority is "high" unless it says otherwise: announced at once.
// "low" waits for the screen reader to finish. The saved toast is "low" so
// that the two buttons show both.
function showSaved() {
  toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast" priority="low">
      <Toast.Title>Saved</Toast.Title>
      <Toast.Description>Your changes were saved.</Toast.Description>
      <Toast.CloseButton>Close</Toast.CloseButton>
    </Toast>
  ));
}

function showError() {
  toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast">
      <Toast.Title>Failed</Toast.Title>
      <Toast.Description>Could not save.</Toast.Description>
      <Toast.CloseButton>Close</Toast.CloseButton>
    </Toast>
  ));
}

export default function ToastDemo() {
  return (
    <>
      <div class="row">
        <button onClick={showSaved}>Show toast</button>
        <button onClick={showError}>Show error toast</button>
      </div>
      <Portal>
        <Toast.Region>
          <Toast.List class="toasts" />
        </Toast.Region>
      </Portal>
    </>
  );
}
