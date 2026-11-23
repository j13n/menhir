// The props of the test lists in Menu.tsx and Combobox.tsx, which wire list
// navigation as Menu (#99) and Combobox (#103) will.
import type {
  ListItem,
  ListNavigation,
} from "../../../src/floating/list-navigation/listNavigation.ts";

/** An item of a test list, named by its label. */
export interface TestItem extends ListItem {
  readonly label: string;
}

export interface ListFixtureProps {
  /** The items' labels, by default Apple, Banana, Cherry and Date. */
  items?: string[];
  /** The labels of the items the keys do not reach. */
  unreachable?: string[];
  /** An item's `text`, by its label, for an item whose content is not its label. */
  texts?: Record<string, string>;
  orientation?: "horizontal" | "vertical";
  wrap?: boolean;
  /**
   * Given, the items are in a `popover="manual"` popup, shown while open;
   * left out, the list is always shown.
   */
  open?: boolean;
  /**
   * Whether the popup is shown, by default while open: `true` keeps it shown
   * while closed, as an exit animation does.
   */
  shown?: boolean;
  /** A list two and a half items high (75px), which scrolls. */
  scroll?: boolean;
  /** The `id` of an item by its label, in the `aria-activedescendant` form. */
  ids?: Record<string, string | undefined>;
  onArrowIn?: (item: TestItem, event: KeyboardEvent) => void;
  onArrowOut?: (item: TestItem | undefined, event: KeyboardEvent) => void;
  /** Receives what `onKeyDown` returned for a key: whether the list used it. */
  onKeyUsed?: (used: boolean, event: KeyboardEvent) => void;
  /** Receives the list once, as the fixture is created. */
  onList?: (list: ListNavigation<TestItem>) => void;
  /** Called each time an item reads whether it is active. */
  onRead?: (label: string) => void;
}

export interface ItemProps<T extends TestItem = TestItem> {
  label: string;
  list: ListNavigation<T>;
  unreachable?: string[];
  texts?: Record<string, string>;
  onKeyUsed?: (used: boolean, event: KeyboardEvent) => void;
  onRead?: (label: string) => void;
}
