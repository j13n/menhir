import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createRenderer, isJSDOM, renderOnServer, screen } from "#test-utils";

import { nextTask } from "../input.ts";
import PresenceFixture from "./PresenceFixture.tsx";

const fixture = "/test/floating/presence/PresenceFixture.tsx";

// Long enough never to end during a test.
const css = `
  .animated[data-open] { animation: fade 10s; }
  .animated[data-closed] { animation: fade 10s reverse; }
  @keyframes fade { from { opacity: 0; } }
`;

// jsdom has no showModal(), which opening a dialog open at mount calls.
if (isJSDOM) {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
  });
  afterAll(() => {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>)
      .showModal;
  });
}

describe("presence hydration", () => {
  const { render } = createRenderer();
  let style: HTMLStyleElement | undefined;
  afterEach(() => {
    vi.restoreAllMocks();
    style?.remove();
  });
  const addStyles = () => {
    style = document.head.appendChild(document.createElement("style"));
    style.textContent = css;
  };

  // The server render runs the module: one that read `document` or
  // `window` there would fail it.
  it("renders a defaultOpen dialog with open", async () => {
    const container = await renderOnServer(fixture);

    expect(container.querySelector("dialog")).toHaveAttribute("open");
    expect(container.querySelector("dialog")).toHaveAttribute("data-open");
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements without warnings", async () => {
    const container = await renderOnServer(fixture);
    const serverDialog = container.querySelector("dialog")!;

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await render(() => <PresenceFixture />, { hydrate: container });

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(container.querySelector("dialog")).toBe(serverDialog);
  });

  it.skipIf(isJSDOM)(
    "makes the dialog modal without closing it, and its entry animation runs on",
    async () => {
      addStyles();
      const container = await renderOnServer(fixture);
      const dialog = container.querySelector("dialog")!;
      const [entry] = dialog.getAnimations();
      let closes = 0;
      dialog.addEventListener("close", () => closes++);

      await render(() => <PresenceFixture />, { hydrate: container });
      await nextTask();

      expect(dialog.matches(":modal")).toBe(true);
      expect(closes).toBe(0);
      expect(dialog.getAnimations()).toEqual([entry]);
      expect(entry!.playState).toBe("running");
    },
  );

  it.skipIf(isJSDOM)("closing after hydration runs the exit", async () => {
    addStyles();
    const container = await renderOnServer(fixture);
    const { user } = await render(() => <PresenceFixture />, {
      hydrate: container,
    });
    const dialog = screen.getByTestId("Dialog") as HTMLDialogElement;

    await user.click(screen.getByRole("button", { name: "Close Dialog" }));

    expect(dialog.matches(":modal")).toBe(true);
    for (const animation of dialog.getAnimations()) animation.finish();
    await nextTask();

    expect(dialog.open).toBe(false);
  });
});
