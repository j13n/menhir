import { inject } from "vitest";

/**
 * Server-renders the default export of a fixture module into a new element
 * in the document, ready for `render(ui, { hydrate: element })`. `fixture` is
 * a path from the package root, such as "/test/switch/SwitchFixture.tsx". Only
 * available in `*.hydrate.test.tsx` files, which run in the `hydrate` Vitest
 * project.
 */
export async function renderOnServer(fixture: string): Promise<HTMLElement> {
  const url = inject("renderServerUrl");
  if (!url) {
    throw new Error(
      "renderOnServer needs the render server of the `hydrate` Vitest project. Name the test file *.hydrate.test.tsx.",
    );
  }
  const response = await fetch(
    `${url}/?fixture=${encodeURIComponent(fixture)}`,
  );
  const html = await response.text();
  if (!response.ok) throw new Error(`Server render failed:\n${html}`);

  const container = document.body.appendChild(document.createElement("div"));
  container.innerHTML = html;
  // Scripts set through innerHTML do not run. Run them as a page load would,
  // starting from a fresh registry so that an earlier test's hydration does
  // not count as this page's.
  delete (globalThis as { _$HY?: unknown })._$HY;
  for (const script of container.querySelectorAll("script")) {
    (0, eval)(script.textContent);
  }
  return container;
}
