import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { flush } from "solid-js";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import PreviewCardLoading from "./PreviewCardLoading";

/** Lets fake timers run that long, then the state they set land. */
async function wait(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
  flush();
}

describe("the Preview Card page's Loading recipe", () => {
  // jsdom has no `popover`: shown and hidden by `display`, with no
  // animations.
  const html = HTMLElement.prototype as Partial<HTMLElement>;
  const element = Element.prototype as Partial<Element>;
  beforeAll(() => {
    html.showPopover = function (this: HTMLElement) {
      this.style.display = "block";
    };
    html.hidePopover = function (this: HTMLElement) {
      this.style.removeProperty("display");
    };
    element.getAnimations = () => [];
  });
  afterAll(() => {
    delete html.showPopover;
    delete html.hidePopover;
    delete element.getAnimations;
  });
  afterEach(() => vi.useRealTimers());

  test("loads the card's content on the first opening, under a fallback", async () => {
    vi.useFakeTimers();
    const { artifact } = await captureArtifact(async () => {
      const { getByRole, unmount } = render(() => <PreviewCardLoading />);
      const link = getByRole("link", { name: "Switch" });
      const popup = link.nextElementSibling!;
      expect(popup).toHaveAttribute("popover", "manual");
      // Nothing is asked for while it has never opened.
      await wait(1000);
      expect(popup).toHaveTextContent("");

      fireEvent.pointerEnter(link, { pointerType: "mouse" });
      await wait(700);
      expect(popup).toHaveAttribute("data-open");
      expect(popup).toHaveTextContent("Loading…");

      await wait(500);
      expect(popup.textContent).toMatch(/^Switch A control/);
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
