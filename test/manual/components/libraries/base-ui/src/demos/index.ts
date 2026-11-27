// One entry per page, in the order of the list in the shell. `slug` is the
// name the libraries share (../../../../README.md); `label` is this
// library's own name for the component.
import type { ComponentType } from "react";

import type { Entry } from "../../../../shared/shell.ts";
import "../app.css";
import Accordion from "./accordion.tsx";
import AlertDialog from "./alert-dialog.tsx";
import Autocomplete from "./autocomplete.tsx";
import Avatar from "./avatar.tsx";
import Button from "./button.tsx";
import CheckboxGroup from "./checkbox-group.tsx";
import Checkbox from "./checkbox.tsx";
import Collapsible from "./collapsible.tsx";
import Combobox from "./combobox.tsx";
import ContextMenu from "./context-menu.tsx";
import Dialog from "./dialog.tsx";
import Drawer from "./drawer.tsx";
import Field from "./field.tsx";
import Fieldset from "./fieldset.tsx";
import Form from "./form.tsx";
import Input from "./input.tsx";
import Menu from "./menu.tsx";
import Menubar from "./menubar.tsx";
import Meter from "./meter.tsx";
import MultiCombobox from "./multi-combobox.tsx";
import NavigationMenu from "./navigation-menu.tsx";
import NumberField from "./number-field.tsx";
import OTPField from "./otp-field.tsx";
import Popover from "./popover.tsx";
import PreviewCard from "./preview-card.tsx";
import Progress from "./progress.tsx";
import Radio from "./radio.tsx";
import ScrollArea from "./scroll-area.tsx";
import Select from "./select.tsx";
import Separator from "./separator.tsx";
import Slider from "./slider.tsx";
import Switch from "./switch.tsx";
import Tabs from "./tabs.tsx";
import Toast from "./toast.tsx";
import ToggleGroup from "./toggle-group.tsx";
import Toggle from "./toggle.tsx";
import Toolbar from "./toolbar.tsx";
import Tooltip from "./tooltip.tsx";

export interface Demo extends Entry {
  component: ComponentType;
}

export const demos: Demo[] = [
  // The names of the README's table, in its order.
  { slug: "accordion", label: "Accordion", component: Accordion },
  { slug: "alert-dialog", label: "Alert Dialog", component: AlertDialog },
  { slug: "autocomplete", label: "Autocomplete", component: Autocomplete },
  { slug: "avatar", label: "Avatar", component: Avatar },
  { slug: "checkbox", label: "Checkbox", component: Checkbox },
  { slug: "checkbox-group", label: "Checkbox Group", component: CheckboxGroup },
  { slug: "collapsible", label: "Collapsible", component: Collapsible },
  { slug: "combobox", label: "Combobox", component: Combobox },
  { slug: "context-menu", label: "Context Menu", component: ContextMenu },
  { slug: "dialog", label: "Dialog", component: Dialog },
  { slug: "field", label: "Field", component: Field },
  { slug: "fieldset", label: "Fieldset", component: Fieldset },
  { slug: "form", label: "Form", component: Form },
  { slug: "input", label: "Input", component: Input },
  { slug: "menu", label: "Menu", component: Menu },
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
  { slug: "otp-field", label: "OTP Field", component: OTPField },
  { slug: "popover", label: "Popover", component: Popover },
  { slug: "preview-card", label: "Preview Card", component: PreviewCard },
  { slug: "progress", label: "Progress", component: Progress },
  { slug: "radio", label: "Radio", component: Radio },
  { slug: "scroll-area", label: "Scroll Area", component: ScrollArea },
  { slug: "select", label: "Select", component: Select },
  { slug: "separator", label: "Separator", component: Separator },
  { slug: "slider", label: "Slider", component: Slider },
  { slug: "switch", label: "Switch", component: Switch },
  { slug: "tabs", label: "Tabs", component: Tabs },
  { slug: "toast", label: "Toast", component: Toast },
  { slug: "toggle", label: "Toggle", component: Toggle },
  { slug: "toggle-group", label: "Toggle Group", component: ToggleGroup },
  { slug: "toolbar", label: "Toolbar", component: Toolbar },
  { slug: "tooltip", label: "Tooltip", component: Tooltip },
  // What Base UI has besides, under its own names.
  { slug: "button", label: "Button", component: Button },
  { slug: "drawer", label: "Drawer", component: Drawer },
];
