import { cleanup, fireEvent, render, within } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FRAME_MS } from "./components/MenhirScene";
// Kept outside src/routes so the file-system router never sees it as a page.
import Home from "./routes/index";

/** jsdom has no matchMedia; this answers the reduced-motion query. */
function preferReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  );
}

function setup() {
  const result = render(() => <Home />);
  flush();
  const stone = result.getByRole("img", { name: /menhir/i });
  return { ...result, stone };
}

/** Runs the animation clock forward by whole frames and applies the updates. */
function tick(frames = 1) {
  vi.advanceTimersByTime(frames * FRAME_MS);
  flush();
}

describe("home page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    preferReducedMotion(false);
  });

  afterEach(() => {
    // The animation and the copy confirmation run timers.
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, "clipboard");
  });

  test("puts the stone between the name and the tagline", () => {
    const { getByRole, getByText, stone } = setup();
    const title = getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent("Menhir");
    const tagline = getByText("Unstyled, accessible UI primitives for SolidJS");
    expect(title.compareDocumentPosition(stone)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(stone.compareDocumentPosition(tagline)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  test("turns the stone slowly, with no controls around it", () => {
    const { queryByRole, stone } = setup();
    const first = stone.textContent;
    tick();
    const second = stone.textContent;
    expect(second).not.toBe(first);
    tick();
    expect(stone.textContent).not.toBe(second);
    expect(
      queryByRole("button", { name: /(Pause|Play) animation/ }),
    ).not.toBeInTheDocument();
  });

  test("keeps the stone still for readers who prefer reduced motion", () => {
    preferReducedMotion(true);
    const { stone } = setup();
    const first = stone.textContent;
    tick(10);
    expect(stone.textContent).toBe(first);
  });

  test("shows the install command, and copies it", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { getByRole, getByText } = setup();
    expect(getByText("pnpm add menhir").tagName).toBe("CODE");

    fireEvent.click(getByRole("button", { name: "Copy install command" }));
    await Promise.resolve();
    flush();
    expect(writeText).toHaveBeenCalledWith("pnpm add menhir");
    expect(getByRole("status")).toHaveTextContent("Copied");

    tick(Math.ceil(2000 / FRAME_MS));
    expect(getByRole("status")).toHaveTextContent("");
  });

  test("links to getting started from under the tagline, before the install command", () => {
    const { getByRole, getByText } = setup();
    const link = getByRole("link", { name: /Get started/ });
    expect(link).toHaveAttribute("href", "/docs/getting-started");
    const tagline = getByText("Unstyled, accessible UI primitives for SolidJS");
    expect(tagline.compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(link.compareDocumentPosition(getByText("pnpm add menhir"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  test("sets out the approach as a numbered list, without a heading", () => {
    const { getByRole, queryByRole, queryByText } = setup();
    const list = getByRole("list", { name: "Approach" });
    expect(list.tagName).toBe("OL");
    expect(
      queryByRole("heading", { name: "Approach" }),
    ).not.toBeInTheDocument();
    expect(queryByText(/the earlier one wins/)).not.toBeInTheDocument();
    expect(
      within(list)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["Solid 2.0 idioms", "WAI-ARIA", "Size"]);
    expect(
      within(list).getByRole("link", { name: /WAI-ARIA/ }),
    ).toHaveAttribute("href", "https://www.w3.org/WAI/ARIA/apg/patterns/");
  });

  test("shows a working Switch, linked to its page", async () => {
    const { getByRole } = setup();
    const examples = getByRole("region", { name: "Examples" });
    expect(
      within(examples).queryByRole("heading", { name: "Examples" }),
    ).not.toBeInTheDocument();
    const example = within(examples);
    const control = example.getByRole("switch", { name: "Airplane mode" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    // The switch changes once its click has gone through its hidden input.
    await Promise.resolve();
    flush();
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(example.getByRole("link", { name: "Switch" })).toHaveAttribute(
      "href",
      "/docs/components/switch",
    );
  });

  test("shows a working Checkbox, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const control = example.getByRole("checkbox", { name: "Email updates" });
    expect(control).toHaveAttribute("aria-checked", "true");
    fireEvent.click(control);
    // The checkbox changes once its click has gone through its hidden input.
    await Promise.resolve();
    flush();
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(example.getByRole("link", { name: "Checkbox" })).toHaveAttribute(
      "href",
      "/docs/components/checkbox",
    );
  });

  test("shows a working Toggle, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const control = example.getByRole("button", { name: "Mute" });
    expect(control).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(control);
    // The toggle changes after the click's flush.
    await Promise.resolve();
    flush();
    expect(control).toHaveAttribute("aria-pressed", "true");
    expect(example.getByRole("link", { name: "Toggle" })).toHaveAttribute(
      "href",
      "/docs/components/toggle",
    );
  });

  test("shows a working Toggle Group, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const group = example.getByRole("group", { name: "Text alignment" });
    const left = within(group).getByRole("button", { name: "Left" });
    const center = within(group).getByRole("button", { name: "Center" });
    expect(left).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(center);
    // The group changes after the click's flush.
    await Promise.resolve();
    flush();
    expect(left).toHaveAttribute("aria-pressed", "false");
    expect(center).toHaveAttribute("aria-pressed", "true");
    expect(example.getByRole("link", { name: "Toggle Group" })).toHaveAttribute(
      "href",
      "/docs/components/toggle-group",
    );
  });

  test("shows vertical Separators, linked to their page", () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const separators = example.getAllByRole("separator");
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveAttribute("aria-orientation", "vertical");
    }
    expect(example.getByRole("link", { name: "Separator" })).toHaveAttribute(
      "href",
      "/docs/components/separator",
    );
  });

  test("shows a Progress with its value, linked to its page", () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const progressbar = example.getByRole("progressbar", { name: "Uploading" });
    expect(progressbar).toHaveAttribute("aria-valuenow", "70");
    expect(progressbar).toHaveAttribute("aria-valuetext", "70%");
    expect(progressbar).toHaveTextContent("70%");
    expect(example.getByRole("link", { name: "Progress" })).toHaveAttribute(
      "href",
      "/docs/components/progress",
    );
  });

  test("renders, animates and toggles without tripping a Solid diagnostic", async () => {
    const { artifact } = await captureArtifact(
      () => {
        const { getByRole } = setup();
        tick(2);
        fireEvent.click(getByRole("switch", { name: "Airplane mode" }));
        fireEvent.click(getByRole("checkbox", { name: "Email updates" }));
        fireEvent.click(getByRole("button", { name: "Mute" }));
        flush();
      },
      { scenario: "home-page" },
    );
    expectNoDiagnostics(artifact);
  });

  test("credits the projects that inspired Menhir, in one place", () => {
    const { getByRole } = setup();
    const credits = within(getByRole("contentinfo"));
    const projects = {
      "Base UI": "https://base-ui.com",
      Radix: "https://www.radix-ui.com",
      Kobalte: "https://kobalte.dev",
      corvu: "https://corvu.dev",
    };
    for (const [name, href] of Object.entries(projects)) {
      expect(credits.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(credits.getAllByRole("link")).toHaveLength(4);
  });
});
