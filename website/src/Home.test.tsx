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

/**
 * jsdom has no showModal(), close(), getAnimations() or ResizeObserver,
 * which an open Dialog calls. `close` fires a task later, as in a browser.
 */
function stubDialog() {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    setTimeout(() => this.dispatchEvent(new Event("close")));
  };
  Element.prototype.getAnimations = () => [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}

/**
 * jsdom has no `popover`: `showPopover()` displays the element, which
 * jsdom's own stylesheet hides as a closed popover, and nothing animates.
 */
function stubPopover() {
  HTMLElement.prototype.showPopover = function () {
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = function () {
    this.style.removeProperty("display");
  };
  Element.prototype.getAnimations = () => [];
  // Nor `scrollIntoView`, which a menu's first item gets as it opens.
  Element.prototype.scrollIntoView = () => {};
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
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
    Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
    Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
    Reflect.deleteProperty(Element.prototype, "getAnimations");
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
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

  test("shows a working Collapsible, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const trigger = example.getByRole("button", { name: "Release notes" });
    const panel = example.getByText(/^Adds Collapsible/);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("hidden");
    fireEvent.click(trigger);
    // The collapsible opens after the click's flush.
    await Promise.resolve();
    flush();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(example.getByRole("link", { name: "Collapsible" })).toHaveAttribute(
      "href",
      "/docs/components/collapsible",
    );
  });

  test("shows a working Accordion, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const styled = example.getByRole("button", { name: "Is it styled?" });
    const ssr = example.getByRole("button", { name: "Does it work with SSR?" });
    expect(styled.parentElement).toBe(
      example.getByRole("heading", { name: "Is it styled?" }),
    );
    expect(styled).toHaveAttribute("aria-expanded", "false");
    expect(ssr).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(styled);
    // The accordion opens after the click's flush.
    await Promise.resolve();
    flush();
    expect(styled).toHaveAttribute("aria-expanded", "true");
    expect(
      example.getByRole("region", { name: "Is it styled?" }),
    ).not.toHaveAttribute("hidden");
    fireEvent.click(ssr);
    await Promise.resolve();
    flush();
    expect(ssr).toHaveAttribute("aria-expanded", "true");
    expect(styled).toHaveAttribute("aria-expanded", "false");
    expect(example.getByRole("link", { name: "Accordion" })).toHaveAttribute(
      "href",
      "/docs/components/accordion",
    );
  });

  test("shows working Tabs, linked to their page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const list = example.getByRole("tablist", { name: "Forecast" });
    const monday = within(list).getByRole("tab", { name: "Mon" });
    const tuesday = within(list).getByRole("tab", { name: "Tue" });
    expect(monday).toHaveAttribute("aria-selected", "true");
    expect(example.getByRole("tabpanel", { name: "Mon" })).toHaveTextContent(
      "Sunny, 18°",
    );
    fireEvent.click(tuesday);
    // The tabs select after the click's flush.
    await Promise.resolve();
    flush();
    expect(tuesday).toHaveAttribute("aria-selected", "true");
    expect(monday).toHaveAttribute("aria-selected", "false");
    expect(example.getByRole("tabpanel", { name: "Tue" })).toHaveTextContent(
      "Cloudy, 15°",
    );
    expect(example.getByRole("link", { name: "Tabs" })).toHaveAttribute(
      "href",
      "/docs/components/tabs",
    );
  });

  test("shows a working Dialog, linked to its page", async () => {
    stubDialog();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const trigger = example.getByRole("button", { name: "Edit" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(trigger);
    // The dialog opens after the click's flush.
    await Promise.resolve();
    flush();
    const dialog = getByRole("dialog", { name: "Edit profile" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription(
      "Your name is shown on your posts.",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await Promise.resolve();
    flush();
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toHaveAttribute("data-closed");
    expect(example.getByRole("link", { name: "Dialog" })).toHaveAttribute(
      "href",
      "/docs/components/dialog",
    );
  });

  test("shows a working Alert Dialog, linked to its page", async () => {
    stubDialog();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    fireEvent.click(example.getByRole("button", { name: "Delete draft" }));
    // The dialog opens after the click's flush.
    await Promise.resolve();
    flush();
    const dialog = getByRole("alertdialog", { name: "Delete this draft?" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("It cannot be undone.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await Promise.resolve();
    flush();
    expect(dialog).not.toHaveAttribute("open");
    expect(example.getByRole("link", { name: "Alert Dialog" })).toHaveAttribute(
      "href",
      "/docs/components/alert-dialog",
    );
  });

  test("shows a working Popover, linked to its page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const trigger = example.getByRole("button", { name: "Notifications" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    // The popover opens after the click's flush.
    await Promise.resolve();
    flush();
    const popover = getByRole("dialog", { name: "All caught up" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(popover).toHaveAttribute("data-open");
    expect(popover).toHaveAccessibleDescription("No new notifications.");
    fireEvent.click(within(popover).getByRole("button", { name: "Close" }));
    await Promise.resolve();
    flush();
    expect(popover).toHaveAttribute("data-closed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(example.getByRole("link", { name: "Popover" })).toHaveAttribute(
      "href",
      "/docs/components/popover",
    );
  });

  test("shows a working Menu, linked to its page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const trigger = example.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.click(trigger);
    // The menu opens after the click's flush.
    await Promise.resolve();
    flush();
    const menu = document.getElementById(
      trigger.getAttribute("aria-controls")!,
    )!;
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).toHaveAttribute("data-open");
    expect(menu).toHaveAccessibleName("Actions");
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Rename" }));
    await Promise.resolve();
    flush();
    expect(menu).toHaveAttribute("data-closed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(example.getByRole("link", { name: "Menu" })).toHaveAttribute(
      "href",
      "/docs/components/menu",
    );
  });

  test("shows a working Context Menu, linked to its page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const area = example.getByText("Right-click here");
    // A closed popover is hidden, which has no accessible name to query.
    const menu = document.querySelector<HTMLElement>('[aria-label="Photo"]')!;
    expect(area).toHaveAttribute("data-closed");
    fireEvent.contextMenu(area);
    // The menu opens after the event's flush.
    await Promise.resolve();
    flush();
    expect(area).toHaveAttribute("data-open");
    expect(menu).toHaveAttribute("data-open");
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Rename" }));
    await Promise.resolve();
    flush();
    expect(menu).toHaveAttribute("data-closed");
    expect(example.getByRole("link", { name: "Context Menu" })).toHaveAttribute(
      "href",
      "/docs/components/context-menu",
    );
  });

  test("shows a working Menubar, linked to its page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const bar = example.getByRole("menubar", { name: "Editor" });
    const file = within(bar).getByRole("menuitem", { name: "File" });
    const edit = within(bar).getByRole("menuitem", { name: "Edit" });
    const editMenu = document.getElementById(
      edit.getAttribute("aria-controls")!,
    )!;
    expect(file).toHaveAttribute("tabindex", "0");
    fireEvent.click(edit);
    // The menu opens after the event's flush.
    await Promise.resolve();
    flush();
    expect(edit).toHaveAttribute("data-open");
    expect(editMenu).toHaveAttribute("data-open");
    fireEvent.click(within(editMenu).getByRole("menuitem", { name: "Undo" }));
    await Promise.resolve();
    flush();
    expect(editMenu).toHaveAttribute("data-closed");
    expect(example.getByRole("link", { name: "Menubar" })).toHaveAttribute(
      "href",
      "/docs/components/menubar",
    );
  });

  test("shows a working Select, linked to its page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const trigger = example.getByRole("combobox", { name: "Paper" });
    const list = document.getElementById(
      trigger.getAttribute("aria-controls")!,
    )!;
    expect(trigger).toHaveTextContent("A4");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    // The list opens after the click's flush.
    await Promise.resolve();
    flush();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(list).toHaveAttribute("data-open");
    fireEvent.click(within(list).getByRole("option", { name: "Letter" }));
    await Promise.resolve();
    flush();
    expect(list).toHaveAttribute("data-closed");
    expect(trigger).toHaveTextContent("Letter");
    expect(
      within(list).getByRole("option", { name: "Letter", hidden: true }),
    ).toHaveAttribute("aria-selected", "true");
    expect(example.getByRole("link", { name: "Select" })).toHaveAttribute(
      "href",
      "/docs/components/select",
    );
  });

  test("shows working Tooltips, linked to their page", async () => {
    stubPopover();
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const bold = example.getByRole("button", { name: "Bold" });
    const tooltip = document.getElementById(
      bold.getAttribute("aria-describedby")!,
    )!;
    expect(tooltip).toHaveAttribute("role", "tooltip");
    expect(bold).toHaveAccessibleDescription("Make text bold (Ctrl+B)");
    expect(tooltip).toHaveAttribute("data-closed");
    // Keyboard focus opens it; jsdom matches :focus-visible on any focus.
    bold.focus();
    await Promise.resolve();
    flush();
    expect(tooltip).toHaveAttribute("data-open");
    fireEvent.keyDown(bold, { key: "Escape" });
    await Promise.resolve();
    flush();
    expect(tooltip).toHaveAttribute("data-closed");
    expect(example.getByRole("link", { name: "Tooltip" })).toHaveAttribute(
      "href",
      "/docs/components/tooltip",
    );
  });

  test("shows a working Navigation Menu, linked to its page", async () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const nav = within(example.getByRole("navigation", { name: "Example" }));
    const components = nav.getByRole("button", { name: "Components" });
    const docs = nav.getByRole("button", { name: "Docs" });
    const panel = document.getElementById(
      components.getAttribute("aria-controls")!,
    )!;
    // Its links are in the page while it is closed.
    expect(panel).toHaveAttribute("hidden");
    expect(
      within(panel).getByRole("link", { name: "Switch", hidden: true }),
    ).toBeInTheDocument();

    fireEvent.click(components);
    // The menu opens after the click's flush.
    await Promise.resolve();
    flush();
    expect(components).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");

    fireEvent.click(docs);
    await Promise.resolve();
    flush();
    expect(docs).toHaveAttribute("aria-expanded", "true");
    expect(components).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(docs, { key: "Escape" });
    await Promise.resolve();
    flush();
    expect(docs).toHaveAttribute("aria-expanded", "false");
    expect(
      example.getByRole("link", { name: "Navigation Menu" }),
    ).toHaveAttribute("href", "/docs/components/navigation-menu");
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

  test("shows a Meter with its value, linked to its page", () => {
    const { getByRole } = setup();
    const example = within(getByRole("region", { name: "Examples" }));
    const meter = example.getByRole("meter", { name: "Battery" });
    expect(meter).toHaveAttribute("aria-valuenow", "80");
    expect(meter).toHaveAttribute("aria-valuetext", "80%");
    expect(meter).toHaveTextContent("80%");
    expect(example.getByRole("link", { name: "Meter" })).toHaveAttribute(
      "href",
      "/docs/components/meter",
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
    stubDialog();
    const { artifact } = await captureArtifact(
      () => {
        const { getByRole } = setup();
        tick(2);
        fireEvent.click(getByRole("switch", { name: "Airplane mode" }));
        fireEvent.click(getByRole("checkbox", { name: "Email updates" }));
        fireEvent.click(getByRole("button", { name: "Mute" }));
        fireEvent.click(getByRole("button", { name: "Release notes" }));
        fireEvent.click(getByRole("button", { name: "Is it styled?" }));
        fireEvent.click(getByRole("tab", { name: "Tue" }));
        flush();
        fireEvent.click(getByRole("button", { name: "Edit" }));
        flush();
        fireEvent.click(getByRole("button", { name: "Done", hidden: true }));
        flush();
        fireEvent.click(getByRole("button", { name: "Delete draft" }));
        flush();
        fireEvent.click(getByRole("button", { name: "Cancel", hidden: true }));
        flush();
        fireEvent.click(getByRole("button", { name: "Components" }));
        flush();
        tick();
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
