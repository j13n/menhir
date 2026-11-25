import { afterFlush } from "./afterFlush.ts";

/**
 * Resolves once a part has handled a form reset: in a task after the
 * reset, since the browser resets the controls after the event
 * (`core/formReset.ts`), and then once the consumer's state has flushed.
 */
export async function afterReset(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  await afterFlush();
}
