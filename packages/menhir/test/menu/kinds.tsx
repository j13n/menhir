// The menus built from Menu's parts: Menu, which a button opens, Context
// Menu, which an area opens with `contextmenu`, and Menubar, whose bar's
// items open its menus. Menu's tests of the parts they share run once for
// each (src/context-menu/README.md and src/menubar/README.md, "Test list"):
//
//   describe.each(menuKinds)("<Menu.Item /> in a $name", (kind) => { … });
import type { JSX } from "@solidjs/web";
import { fireEvent, screen } from "@solidjs/testing-library";
import type { UserEvent } from "@testing-library/user-event";

import { ContextMenu } from "../../src/context-menu/index.ts";
import { Menu } from "../../src/menu/index.ts";
import { Menubar } from "../../src/menubar/index.ts";
import { Edit as ContextMenuEdit } from "../context-menu/Edit.tsx";
import { Share as ContextMenuShare } from "../context-menu/Share.tsx";
import { Edit as MenubarEdit } from "../menubar/Edit.tsx";
import { Share as MenubarShare } from "../menubar/Share.tsx";
import {
  centerOf,
  keyboard,
  menuKey,
  nextTask,
  press,
} from "../floating/input.ts";
import { Edit } from "./Edit.tsx";
import type { EditProps } from "./Edit.tsx";
import { Share } from "./Share.tsx";
import type { ShareProps } from "./Share.tsx";

/** The parts both menus take from Menu. */
export type MenuParts = Pick<
  typeof Menu,
  | "Popup"
  | "Item"
  | "CheckboxItem"
  | "ItemIndicator"
  | "Group"
  | "GroupLabel"
  | "RadioGroup"
  | "RadioItem"
  | "Submenu"
  | "SubmenuTrigger"
>;

export interface MenuKind {
  /** As the tests' names show it. */
  name: string;
  /** The parts, from this menu's namespace. */
  M: MenuParts;
  /** `test/menu/Edit.tsx`, or its Context Menu version. */
  Edit(props: EditProps): JSX.Element;
  /** `test/menu/Share.tsx`, or its Context Menu version. */
  Share(props: ShareProps): JSX.Element;
  /** What opens the Root's menu, where focus returns once it closes. */
  trigger(): HTMLElement;
  /**
   * Where Shift+Tab from the menus sends focus: the Trigger, or for a
   * Menubar the element before the bar.
   */
  shiftTab(): HTMLElement;
  /** The Root's menu. */
  menu(): HTMLElement;
  /** Opens the Root's menu with a press, by Testing Library. */
  open(user: UserEvent): Promise<void>;
  /** Opens the Root's menu from the keyboard, by Testing Library. */
  openFromKey(user: UserEvent): Promise<void>;
  /** Opens the Root's menu with a real press, off it after (Chromium). */
  pressOpen(): Promise<void>;
  /** Opens the Root's menu from the keyboard with real input (Chromium). */
  keyOpen(): Promise<void>;
}

const menuTrigger = () => screen.getByRole("button", { name: "Edit" });
const area = () => screen.getByTestId("area");
const barItem = () => screen.getByRole("menuitem", { name: "Edit" });

export const menuKinds: MenuKind[] = [
  {
    name: "Menu",
    M: Menu,
    Edit,
    Share,
    trigger: menuTrigger,
    shiftTab: menuTrigger,
    menu: () =>
      document.getElementById(menuTrigger().getAttribute("aria-controls")!)!,
    open: (user) => user.click(menuTrigger()),
    openFromKey: async (user) => {
      menuTrigger().focus();
      await user.keyboard("{ArrowDown}");
    },
    pressOpen: async () => {
      await press(centerOf(menuTrigger()));
      await nextTask();
    },
    keyOpen: async () => {
      menuTrigger().focus();
      await keyboard("{ArrowDown}");
      await nextTask();
    },
  },
  {
    name: "Context Menu",
    M: ContextMenu,
    Edit: ContextMenuEdit,
    Share: ContextMenuShare,
    trigger: area,
    shiftTab: area,
    // The first in the document: a submenu's sits inside it.
    menu: () => screen.getAllByRole("menu", { hidden: true })[0]!,
    open: (user) => user.pointer({ keys: "[MouseRight]", target: area() }),
    openFromKey: async () => {
      area().focus();
      // A key's `contextmenu`, as the Pointer Events spec sends it.
      fireEvent(
        area(),
        new PointerEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          button: -1,
          pointerType: "",
        }),
      );
    },
    pressOpen: async () => {
      const point = centerOf(area());
      await press(point, point, "right");
      await nextTask();
    },
    keyOpen: async () => {
      area().focus();
      await menuKey();
      await nextTask();
    },
  },
  {
    name: "Menubar",
    M: Menubar,
    Edit: MenubarEdit,
    Share: MenubarShare,
    trigger: barItem,
    shiftTab: () => screen.getByRole("button", { name: "Before" }),
    menu: () =>
      document.getElementById(barItem().getAttribute("aria-controls")!)!,
    open: (user) => user.click(barItem()),
    openFromKey: async (user) => {
      barItem().focus();
      await user.keyboard("{ArrowDown}");
    },
    pressOpen: async () => {
      await press(centerOf(barItem()));
      await nextTask();
    },
    keyOpen: async () => {
      barItem().focus();
      await keyboard("{ArrowDown}");
      await nextTask();
    },
  },
];
