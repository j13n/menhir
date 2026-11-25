import { createToastManager } from "menhir/toast";
import { action } from "solid-js";

export const toasts = createToastManager();

declare const api: { save(draft: string): Promise<void> };

// One toast follows the request: it stays while the request runs, then
// says how it ended. update() starts its time again.
export const save = action(function* (draft: string) {
  const id = toasts.add({ title: "Saving…", duration: Infinity });
  try {
    yield api.save(draft);
    toasts.update(id, { title: "Saved", duration: 5000 });
  } catch {
    toasts.update(id, {
      title: "Could not save",
      description: "Your draft is kept. Try again.",
      priority: "high",
      // Stays until it is closed: render a Toast.Close in its Root.
      duration: Infinity,
    });
  }
});
