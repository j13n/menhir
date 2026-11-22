// @vitest-environment jsdom
//
// Builds the app for the server and for the client, as `vite build --ssr` and
// `vite build` do, then renders the server bundle to a string and lets the
// client bundle hydrate it. `pnpm test` builds menhir first.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { build } from "vite";
import { beforeAll, describe, expect, it } from "vitest";

const root = `${import.meta.dirname}/`;
const bundle = (name: string) => `${root}dist/${name}.js`;

async function buildEntry(name: string, ssr: boolean) {
  await build({
    root,
    logLevel: "silent",
    build: {
      ssr,
      minify: false,
      emptyOutDir: false,
      rolldownOptions: {
        input: `${root}src/${name}.tsx`,
        output: { entryFileNames: `${name}.js` },
      },
    },
  });
}

describe("an SSR app that uses menhir", () => {
  beforeAll(async () => {
    await buildEntry("entry-server", true);
    await buildEntry("entry-client", false);
  });

  it("compiles the JSX source from the `solid` condition for the server", () => {
    const server = readFileSync(bundle("entry-server"), "utf8");

    // Bundled from dist/source and compiled for SSR. Left external, Node
    // would load the `import` entry, which is DOM code.
    expect(server).not.toMatch(/from ["']menhir/);
    expect(server).toContain("ssrHydrationKey");
  });

  it("renders on the server and hydrates on the client, where a Dialog opens", async () => {
    // In a Node process of its own: inside this jsdom test, the bundle's
    // import of Solid would resolve to the browser build.
    const html = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `import { render } from ${JSON.stringify(bundle("entry-server"))};
         process.stdout.write(render());`,
      ],
      { encoding: "utf8" },
    );
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toMatch(/<dialog[^>]*data-closed/);

    document.body.innerHTML = `<div id="app">${html}</div>`;
    for (const script of document.body.querySelectorAll("script")) {
      (0, eval)(script.textContent);
    }
    const serverElement = document.querySelector<HTMLElement>("[role=switch]")!;
    const serverDialog = document.querySelector("dialog")!;
    // jsdom has no showModal(), which opening the dialog calls, nor the
    // ResizeObserver its scroll lock uses.
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    await import(/* @vite-ignore */ bundle("entry-client"));

    // Hydration adopts the server's element. A client render would replace it.
    const switchEl = document.querySelector<HTMLElement>("[role=switch]")!;
    expect(switchEl).toBe(serverElement);

    // A native button turns Enter and Space into a click, but not a
    // dispatched key event, so click it.
    switchEl.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(switchEl.getAttribute("aria-checked")).toBe("true");

    const dialog = document.querySelector("dialog")!;
    expect(dialog).toBe(serverDialog);
    document.querySelector<HTMLElement>("[aria-haspopup=dialog]")!.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(dialog.open).toBe(true);
    expect(dialog.hasAttribute("data-open")).toBe(true);
  });
});
