// One entry per page, in the order of the list in the shell. `slug` is the
// name the libraries share (../../../../README.md); `label` is this
// library's own name for the component.
import type { Component } from "solid-js";

import type { Entry } from "../../../../shared/shell.ts";
import "../app.css";

import Accordion from "./accordion.tsx";
import AlertDialog from "./alert-dialog.tsx";
import Alert from "./alert.tsx";
import Autocomplete from "./autocomplete.tsx";
import Avatar from "./avatar.tsx";
import Badge from "./badge.tsx";
import Breadcrumbs from "./breadcrumbs.tsx";
import Button from "./button.tsx";
import Checkbox from "./checkbox.tsx";
import Collapsible from "./collapsible.tsx";
import ColorArea from "./color-area.tsx";
import ColorChannelField from "./color-channel-field.tsx";
import ColorField from "./color-field.tsx";
import ColorSlider from "./color-slider.tsx";
import ColorSwatch from "./color-swatch.tsx";
import ColorWheel from "./color-wheel.tsx";
import Combobox from "./combobox.tsx";
import ContextMenu from "./context-menu.tsx";
import Dialog from "./dialog.tsx";
import Field from "./field.tsx";
import FileField from "./file-field.tsx";
import Input from "./input.tsx";
import Link from "./link.tsx";
import Listbox from "./listbox.tsx";
import Menu from "./menu.tsx";
import Menubar from "./menubar.tsx";
import Meter from "./meter.tsx";
import MultiCombobox from "./multi-combobox.tsx";
import NavigationMenu from "./navigation-menu.tsx";
import NumberField from "./number-field.tsx";
import Pagination from "./pagination.tsx";
import Popover from "./popover.tsx";
import PreviewCard from "./preview-card.tsx";
import Progress from "./progress.tsx";
import Radio from "./radio.tsx";
import Rating from "./rating.tsx";
import SegmentedControl from "./segmented-control.tsx";
import Select from "./select.tsx";
import Separator from "./separator.tsx";
import Skeleton from "./skeleton.tsx";
import Slider from "./slider.tsx";
import Switch from "./switch.tsx";
import Tabs from "./tabs.tsx";
import TimeField from "./time-field.tsx";
import Toast from "./toast.tsx";
import ToggleGroup from "./toggle-group.tsx";
import Toggle from "./toggle.tsx";
import Tooltip from "./tooltip.tsx";

export interface Demo extends Entry {
  component: Component;
}

export const demos: Demo[] = [
  // The names of the README's table, in its order.
  { slug: "accordion", label: "Accordion", component: Accordion },
  { slug: "alert-dialog", label: "Alert Dialog", component: AlertDialog },
  { slug: "autocomplete", label: "Search", component: Autocomplete },
  { slug: "avatar", label: "Image", component: Avatar },
  { slug: "checkbox", label: "Checkbox", component: Checkbox },
  { slug: "collapsible", label: "Collapsible", component: Collapsible },
  { slug: "combobox", label: "Combobox", component: Combobox },
  { slug: "context-menu", label: "Context Menu", component: ContextMenu },
  { slug: "dialog", label: "Dialog", component: Dialog },
  { slug: "field", label: "Text Field (validation)", component: Field },
  { slug: "input", label: "Text Field", component: Input },
  { slug: "menu", label: "Dropdown Menu", component: Menu },
  { slug: "menubar", label: "Menubar", component: Menubar },
  { slug: "meter", label: "Meter", component: Meter },
  {
    slug: "multi-combobox",
    label: "Combobox (multiple)",
    component: MultiCombobox,
  },
  {
    slug: "navigation-menu",
    label: "Navigation Menu",
    component: NavigationMenu,
  },
  { slug: "number-field", label: "Number Field", component: NumberField },
  { slug: "popover", label: "Popover", component: Popover },
  { slug: "preview-card", label: "Hover Card", component: PreviewCard },
  { slug: "progress", label: "Progress", component: Progress },
  { slug: "radio", label: "Radio Group", component: Radio },
  { slug: "select", label: "Select", component: Select },
  { slug: "separator", label: "Separator", component: Separator },
  { slug: "slider", label: "Slider", component: Slider },
  { slug: "switch", label: "Switch", component: Switch },
  { slug: "tabs", label: "Tabs", component: Tabs },
  { slug: "toast", label: "Toast", component: Toast },
  { slug: "toggle", label: "Toggle Button", component: Toggle },
  { slug: "toggle-group", label: "Toggle Group", component: ToggleGroup },
  { slug: "tooltip", label: "Tooltip", component: Tooltip },

  // What only Kobalte has a name for, alphabetically.
  { slug: "alert", label: "Alert", component: Alert },
  { slug: "badge", label: "Badge", component: Badge },
  { slug: "breadcrumbs", label: "Breadcrumbs", component: Breadcrumbs },
  { slug: "button", label: "Button", component: Button },
  { slug: "color-area", label: "Color Area", component: ColorArea },
  {
    slug: "color-channel-field",
    label: "Color Channel Field",
    component: ColorChannelField,
  },
  { slug: "color-field", label: "Color Field", component: ColorField },
  { slug: "color-slider", label: "Color Slider", component: ColorSlider },
  { slug: "color-swatch", label: "Color Swatch", component: ColorSwatch },
  { slug: "color-wheel", label: "Color Wheel", component: ColorWheel },
  { slug: "file-field", label: "File Field", component: FileField },
  { slug: "link", label: "Link", component: Link },
  { slug: "listbox", label: "Listbox", component: Listbox },
  { slug: "pagination", label: "Pagination", component: Pagination },
  { slug: "rating", label: "Rating", component: Rating },
  {
    slug: "segmented-control",
    label: "Segmented Control",
    component: SegmentedControl,
  },
  { slug: "skeleton", label: "Skeleton", component: Skeleton },
  { slug: "time-field", label: "Time Field", component: TimeField },
];
