// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a dialog open by default, which the server renders with
// `open`, and which animates in on `[data-open]` and out on `[data-closed]`.
import { Dialog } from "./Dialog.tsx";

export default function PresenceFixture() {
  return <Dialog defaultOpen class="animated" />;
}
