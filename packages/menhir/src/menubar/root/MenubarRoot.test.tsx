// The test list and the cases left out are in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  isJSDOM,
  screen,
} from "#test-utils";

import { keyboard, nextTask } from "../../../test/floating/input.ts";
import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { Editor } from "../../../test/menubar/Editor.tsx";
import { Menubar } from "../index.ts";

const bar = () => screen.getByRole("menubar");
const barItem = (name: string) => screen.getByRole("menuitem", { name });
const active = () => document.activeElement;

describeConformance(
  "<Menubar.Root />",
  (props) => <Menubar.Root {...props} />,
  { tagName: "DIV" },
);

describe("<Menubar.Root />", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("renders a div with the menubar role, named by the consumer's aria-label", async () => {
    await render(() => <Editor />);

    expect(bar().tagName).toBe("DIV");
    expect(bar()).toHaveAccessibleName("Editor");
  });

  it("is one tab stop: the first item, then the item that last had focus", async () => {
    const { user } = await render(() => <Editor />);
    const tabindexes = () =>
      ["File", "Edit", "View"].map((name) =>
        barItem(name).getAttribute("tabindex"),
      );

    expect(tabindexes()).toEqual(["0", "-1", "-1"]);

    barItem("File").focus();
    await user.keyboard("{ArrowRight}");

    expect(active()).toBe(barItem("Edit"));
    expect(tabindexes()).toEqual(["-1", "0", "-1"]);
  });

  it("moves with Right and Left Arrow, wrapping, and to the first and last item with Home and End", async () => {
    const { user } = await render(() => <Editor />);
    barItem("File").focus();

    await user.keyboard("{ArrowRight}");
    expect(active()).toBe(barItem("Edit"));
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(active()).toBe(barItem("File"));
    await user.keyboard("{ArrowLeft}");
    expect(active()).toBe(barItem("View"));
    await user.keyboard("{Home}");
    expect(active()).toBe(barItem("File"));
    await user.keyboard("{End}");
    expect(active()).toBe(barItem("View"));
    // Nothing opened on the way.
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it.skipIf(isJSDOM)(
    "moves to the next item with Left Arrow right to left",
    async () => {
      await render(() => <Editor dir="rtl" />);
      barItem("File").focus();

      await keyboard("{ArrowLeft}");
      expect(active()).toBe(barItem("Edit"));
      await keyboard("{ArrowRight}");
      expect(active()).toBe(barItem("File"));
    },
  );

  it("moves to the next item that starts with a typed character", async () => {
    const { user } = await render(() => <Editor />);
    barItem("File").focus();

    await user.keyboard("v");
    expect(active()).toBe(barItem("View"));
    await user.keyboard("e");
    // A second character within a second makes "ve", which matches nothing.
    expect(active()).toBe(barItem("View"));
  });

  it.skipIf(isJSDOM)(
    "is entered by Tab at its tab stop, and left by Tab from it",
    async () => {
      await render(() => <Editor />);
      screen.getByRole("button", { name: "Before" }).focus();

      await keyboard("{Tab}");
      expect(active()).toBe(barItem("File"));
      await keyboard("{ArrowRight}{Tab}");
      expect(active()).toBe(screen.getByRole("button", { name: "After" }));
      await keyboard("{Shift>}{Tab}{/Shift}");
      expect(active()).toBe(barItem("Edit"));
      await nextTask();
      expect(screen.queryByRole("menu")).toBeNull();
    },
  );
});
