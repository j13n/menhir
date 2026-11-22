// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed Dialog, and one open by default, which the server
// renders closed (README, "Decisions").
import { Dialog } from "../../src/dialog/index.ts";

export default function DialogFixture() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>Edit</Dialog.Trigger>
        <Dialog.Popup data-testid="edit">
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Shown on your posts.</Dialog.Description>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>
      <Dialog.Root defaultOpen>
        <Dialog.Popup data-testid="welcome">
          <Dialog.Title>Welcome</Dialog.Title>
          <Dialog.Close>Start</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>
    </>
  );
}
