import { describe, expect, it } from "vitest";

import { createRenderer, isJSDOM, screen } from "#test-utils";

import { tabStops } from "./tabbable.ts";

/** The ids of the tab stops inside the element with test id `root`. */
function stops() {
  return tabStops(screen.getByTestId("root")).map((element) => element.id);
}

describe("tabStops", () => {
  const { render } = createRenderer();

  it.skipIf(isJSDOM)(
    "finds the native focusable elements and tabindex 0, in tree order",
    async () => {
      await render(() => (
        <div data-testid="root">
          <button id="button">Button</button>
          <a id="link" href="#top">
            Link
          </a>
          <div>
            <input id="input" aria-label="Input" />
            <select id="select" aria-label="Select" />
          </div>
          <textarea id="textarea" aria-label="Text" />
          <div id="tabindex" tabindex="0">
            Tabbable
          </div>
          <details>
            <summary id="summary">Summary</summary>
          </details>
        </div>
      ));

      expect(stops()).toEqual([
        "button",
        "link",
        "input",
        "select",
        "textarea",
        "tabindex",
        "summary",
      ]);
    },
  );

  it.skipIf(isJSDOM)(
    "leaves out tabindex -1, a link without href and a hidden input",
    async () => {
      await render(() => (
        <div data-testid="root">
          <div id="negative" tabindex="-1">
            Not in the sequence
          </div>
          <button id="negative-button" tabindex="-1">
            Not in the sequence
          </button>
          <a id="no-href">Not a link</a>
          <input id="hidden-input" type="hidden" />
          <button id="button">Button</button>
        </div>
      ));

      expect(stops()).toEqual(["button"]);
    },
  );

  it.skipIf(isJSDOM)(
    "leaves out disabled controls, and those in a disabled fieldset but not in its first legend",
    async () => {
      await render(() => (
        <div data-testid="root">
          <button id="disabled" disabled>
            Disabled
          </button>
          <fieldset disabled>
            <legend>
              <button id="in-legend">In the legend</button>
            </legend>
            <input id="in-fieldset" aria-label="In the fieldset" />
          </fieldset>
        </div>
      ));

      expect(stops()).toEqual(["in-legend"]);
    },
  );

  it.skipIf(isJSDOM)("leaves out what is hidden", async () => {
    await render(() => (
      <div data-testid="root">
        <div hidden>
          <button id="hidden">Hidden</button>
        </div>
        <div style={{ display: "none" }}>
          <button id="display-none">Not displayed</button>
        </div>
        <div style={{ visibility: "hidden" }}>
          <button id="invisible">Invisible</button>
          <button id="visible-again" style={{ visibility: "visible" }}>
            Visible again
          </button>
        </div>
        <div hidden="until-found">
          <button id="until-found">Until found</button>
        </div>
      </div>
    ));

    expect(stops()).toEqual(["visible-again"]);
  });

  it.skipIf(isJSDOM)(
    "leaves out the content of a closed details, and keeps its first summary",
    async () => {
      await render(() => (
        <div data-testid="root">
          <details>
            <summary id="summary">Summary</summary>
            <summary id="second-summary">Second summary</summary>
            <button id="closed">In a closed details</button>
          </details>
          <details open>
            <summary id="open-summary">Open</summary>
            <button id="open">In an open details</button>
          </details>
        </div>
      ));

      expect(stops()).toEqual(["summary", "open-summary", "open"]);
    },
  );

  it.skipIf(isJSDOM)("leaves out an inert subtree", async () => {
    await render(() => (
      <div data-testid="root">
        <div inert>
          <button id="inert">Inert</button>
          <div>
            <button id="deeper">Deeper</button>
          </div>
        </div>
        <button id="button">Button</button>
      </div>
    ));

    expect(stops()).toEqual(["button"]);
  });

  it.skipIf(isJSDOM)(
    "counts a contenteditable editing host, not its children, and not one with tabindex -1",
    async () => {
      await render(() => (
        <div data-testid="root">
          <div id="editor" contenteditable="true">
            <p id="paragraph">Text</p>
          </div>
          <div id="not-editable" contenteditable="false">
            Text
          </div>
          <div id="negative-editor" contenteditable="true" tabindex="-1">
            Text
          </div>
        </div>
      ));

      expect(stops()).toEqual(["editor"]);
    },
  );

  it.skipIf(isJSDOM)(
    "counts a radio group once: its checked radio, else its first",
    async () => {
      await render(() => (
        <div data-testid="root">
          <input id="size-s" type="radio" name="size" aria-label="Small" />
          <input
            id="size-m"
            type="radio"
            name="size"
            aria-label="Medium"
            checked
          />
          <input id="color-red" type="radio" name="color" aria-label="Red" />
          <input id="color-blue" type="radio" name="color" aria-label="Blue" />
          <input id="unnamed-1" type="radio" aria-label="One" />
          <input id="unnamed-2" type="radio" aria-label="Two" />
          <form>
            <input
              id="other-form"
              type="radio"
              name="size"
              aria-label="Small"
            />
          </form>
        </div>
      ));

      expect(stops()).toEqual([
        "size-m",
        "color-red",
        "unnamed-1",
        "unnamed-2",
        "other-form",
      ]);
    },
  );

  it.skipIf(isJSDOM)(
    "searches an open shadow root, slotted elements at their slot, and a slot's fallback",
    async () => {
      await render(() => (
        <div data-testid="root">
          <button id="before">Before</button>
          <div
            id="host"
            ref={(host) => {
              host.attachShadow({ mode: "open" }).innerHTML =
                '<button id="shadow-first">First</button>' +
                '<slot name="main"></slot>' +
                '<slot name="empty"><button id="fallback">Fallback</button></slot>' +
                '<button id="shadow-last">Last</button>';
            }}
          >
            <button id="slotted" slot="main">
              Slotted
            </button>
            <button id="unassigned">Not shown</button>
          </div>
          <button id="after">After</button>
        </div>
      ));

      expect(stops()).toEqual([
        "before",
        "shadow-first",
        "slotted",
        "fallback",
        "shadow-last",
        "after",
      ]);
    },
  );

  it.skipIf(isJSDOM)("counts an iframe and a video with controls", async () => {
    await render(() => (
      <div data-testid="root">
        <iframe id="frame" title="Frame" />
        <video id="video" controls />
      </div>
    ));

    expect(stops()).toEqual(["frame", "video"]);
  });

  it.skipIf(isJSDOM)(
    "puts positive tabindex values first, in ascending order",
    async () => {
      await render(() => (
        <div data-testid="root">
          <button id="zero">Zero</button>
          <button id="two" tabindex="2">
            Two
          </button>
          <button id="one" tabindex="1">
            One
          </button>
          <button id="another-two" tabindex="2">
            Another two
          </button>
          <button id="last">Last</button>
        </div>
      ));

      expect(stops()).toEqual(["one", "two", "another-two", "zero", "last"]);
    },
  );
});
