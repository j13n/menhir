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

  it("renders on the server and hydrates on the client, where a Dialog, a Popover, a Tooltip, a Navigation Menu, a Menu, a Select and a Combobox open", async () => {
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
    expect(html).toMatch(/<div(?=[^>]*popover="auto")(?=[^>]*data-closed)/);
    expect(html).toMatch(
      /<div(?=[^>]*popover="manual")(?=[^>]*role="tooltip")/,
    );
    // A closed Navigation Menu Panel, with its link, is in the server HTML.
    expect(html).toMatch(/<nav[^>]*aria-label="Main"/);
    expect(html).toMatch(
      /<div(?=[^>]*hidden)(?=[^>]*data-closed)[^>]*><a[^>]*href="\/switch"/,
    );
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toMatch(/<div(?=[^>]*role="menu")(?=[^>]*data-closed)/);
    // A closed Select's items are in the server HTML, and its hidden
    // input has the value before any script runs.
    expect(html).toContain('role="combobox"');
    expect(html).toMatch(/<input(?=[^>]*name="fruit")(?=[^>]*value="banana")/);
    expect(html).toMatch(
      /<div(?=[^>]*role="option")(?=[^>]*aria-selected="true")[^>]*>Banana/,
    );
    // A Combobox's input has its text, and its hidden input the value.
    expect(html).toMatch(
      /<input(?=[^>]*role="combobox")(?=[^>]*value="Norway")/,
    );
    expect(html).toMatch(/<input(?=[^>]*name="country")(?=[^>]*value="no")/);

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
    // Nor `popover`, which opening the popover calls, nor `scrollIntoView`,
    // which a menu's first item gets as it opens.
    HTMLElement.prototype.showPopover = function () {};
    Element.prototype.scrollIntoView = function () {};
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

    const popover = document.querySelector("[popover]")!;
    const popoverTrigger = document.querySelector<HTMLElement>(
      `[popovertarget="${popover.id}"]`,
    )!;
    popoverTrigger.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(popoverTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(popover.hasAttribute("data-open")).toBe(true);

    const tooltip = document.querySelector("[role=tooltip]")!;
    const tooltipTrigger = document.querySelector<HTMLElement>(
      `[aria-describedby="${tooltip.id}"]`,
    )!;
    // Keyboard focus opens it; jsdom matches `:focus-visible` on any focus.
    tooltipTrigger.focus();
    await new Promise((resolve) => setTimeout(resolve));
    expect(tooltip.hasAttribute("data-open")).toBe(true);

    const navTrigger = document.querySelector<HTMLElement>("nav button")!;
    const navPanel = document.getElementById(
      navTrigger.getAttribute("aria-controls")!,
    )!;
    expect(navPanel.hidden).toBe(true);
    navTrigger.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(navTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(navPanel.hidden).toBe(false);

    const menuTrigger = document.querySelector<HTMLElement>(
      "[aria-haspopup=menu]",
    )!;
    menuTrigger.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(menuTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      document
        .getElementById(menuTrigger.getAttribute("aria-controls")!)!
        .hasAttribute("data-open"),
    ).toBe(true);

    const selectTrigger =
      document.querySelector<HTMLElement>("[role=combobox]")!;
    const options = document.getElementById(
      selectTrigger.getAttribute("aria-controls")!,
    )!;
    selectTrigger.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(selectTrigger.getAttribute("aria-expanded")).toBe("true");
    options.querySelector<HTMLElement>("[role=option]")!.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(options.hasAttribute("data-closed")).toBe(true);
    expect(selectTrigger.textContent).toBe("Apple");
    expect(
      document.querySelector<HTMLInputElement>("input[name=fruit]")!.value,
    ).toBe("apple");

    const comboboxInput = document.querySelector<HTMLInputElement>(
      "input[role=combobox]",
    )!;
    const countries = document.getElementById(
      comboboxInput.getAttribute("aria-controls")!,
    )!;
    comboboxInput.focus();
    comboboxInput.value = "new";
    comboboxInput.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve));
    expect(comboboxInput.getAttribute("aria-expanded")).toBe("true");
    countries.querySelector<HTMLElement>("[role=option]")!.click();
    await new Promise((resolve) => setTimeout(resolve));
    expect(comboboxInput.getAttribute("aria-expanded")).toBe("false");
    expect(comboboxInput.value).toBe("New Zealand");
    expect(
      document.querySelector<HTMLInputElement>("input[name=country]")!.value,
    ).toBe("nz");
  });
});
