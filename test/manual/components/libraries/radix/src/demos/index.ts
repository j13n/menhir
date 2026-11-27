// One entry per page, in the order of the list in the shell. `slug` is the
// name the libraries share (../../../../README.md); `label` is this
// library's own name for the component.
import type { ComponentType } from "react";

import type { Entry } from "../../../../shared/shell.ts";
import "../app.css";
import AccessibleIcon from "./accessible-icon.tsx";
import Accordion from "./accordion.tsx";
import AlertDialog from "./alert-dialog.tsx";
import AspectRatio from "./aspect-ratio.tsx";
import Avatar from "./avatar.tsx";
import Checkbox from "./checkbox.tsx";
import Collapsible from "./collapsible.tsx";
import ContextMenu from "./context-menu.tsx";
import Dialog from "./dialog.tsx";
import Field from "./field.tsx";
import Form from "./form.tsx";
import Label from "./label.tsx";
import Menu from "./menu.tsx";
import Menubar from "./menubar.tsx";
import NavigationMenu from "./navigation-menu.tsx";
import OtpField from "./otp-field.tsx";
import PasswordToggleField from "./password-toggle-field.tsx";
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
import Toggle from "./toggle.tsx";
import ToggleGroup from "./toggle-group.tsx";
import Toolbar from "./toolbar.tsx";
import Tooltip from "./tooltip.tsx";

export interface Demo extends Entry {
  component: ComponentType;
}

export const demos: Demo[] = [
  // The names of the README's table, in its order.
  { slug: "accordion", label: "Accordion", component: Accordion },
  { slug: "alert-dialog", label: "Alert Dialog", component: AlertDialog },
  { slug: "avatar", label: "Avatar", component: Avatar },
  { slug: "checkbox", label: "Checkbox", component: Checkbox },
  { slug: "collapsible", label: "Collapsible", component: Collapsible },
  { slug: "context-menu", label: "Context Menu", component: ContextMenu },
  { slug: "dialog", label: "Dialog", component: Dialog },
  { slug: "field", label: "Form Field", component: Field },
  { slug: "form", label: "Form", component: Form },
  { slug: "menu", label: "Dropdown Menu", component: Menu },
  { slug: "menubar", label: "Menubar", component: Menubar },
  {
    slug: "navigation-menu",
    label: "Navigation Menu",
    component: NavigationMenu,
  },
  {
    slug: "otp-field",
    label: "One-Time Password Field (preview)",
    component: OtpField,
  },
  { slug: "popover", label: "Popover", component: Popover },
  { slug: "preview-card", label: "Hover Card", component: PreviewCard },
  { slug: "progress", label: "Progress", component: Progress },
  { slug: "radio", label: "Radio Group", component: Radio },
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
  // Radix's own.
  {
    slug: "accessible-icon",
    label: "Accessible Icon",
    component: AccessibleIcon,
  },
  { slug: "aspect-ratio", label: "Aspect Ratio", component: AspectRatio },
  { slug: "label", label: "Label", component: Label },
  {
    slug: "password-toggle-field",
    label: "Password Toggle Field (preview)",
    component: PasswordToggleField,
  },
];
