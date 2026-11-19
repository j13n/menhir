// Runs inside the Vite SSR server that renderServer.ts starts, so this module
// and the fixture share one server build of Solid.
import { createComponent } from "solid-js";
import { generateHydrationScript, renderToString } from "@solidjs/web";

/**
 * Renders the default export of the module at `path`, a root-relative URL.
 * The HTML starts with Solid's hydration script, as a server-rendered page
 * does: `hydrate` needs the registry that script creates.
 */
export async function render(path: string): Promise<string> {
  const fixture = await import(/* @vite-ignore */ path);
  return (
    generateHydrationScript() +
    renderToString(() => createComponent(fixture.default, {}))
  );
}
