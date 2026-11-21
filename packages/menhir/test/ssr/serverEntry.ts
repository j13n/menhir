// Runs inside the Vite SSR server that renderServer.ts starts, so this module
// and the fixture share one server build of Solid.
import { createComponent } from "solid-js";
import { generateHydrationScript, renderToString } from "@solidjs/web";
import { provideRequestEvent } from "@solidjs/web/storage";

/**
 * Renders the default export of the module at `path`, a root-relative URL.
 * The HTML starts with Solid's hydration script, as a server-rendered page
 * does: `hydrate` needs the registry that script creates. The render sees a
 * request from `getRequestEvent()`, with `options.cookie` as its `Cookie`
 * header.
 */
export async function render(
  path: string,
  options: { cookie?: string } = {},
): Promise<string> {
  const fixture = await import(/* @vite-ignore */ path);
  const headers = new Headers();
  if (options.cookie !== undefined) headers.set("cookie", options.cookie);
  const request = new Request("http://localhost/", { headers });
  return provideRequestEvent(
    { request, locals: {} },
    () =>
      generateHydrationScript() +
      renderToString(() => createComponent(fixture.default, {})),
  );
}
