// One entry per page, in the order of the list in the shell. `slug` is the
// name the libraries share (../../../../README.md); `label` is this
// library's own name for the component.
import type { Component } from "solid-js";

import type { Entry } from "../../../../shared/shell.ts";
import "../app.css";
import Accordion from "./accordion.tsx";
import AlertDialog from "./alert-dialog.tsx";
import Calendar from "./calendar.tsx";
import Disclosure from "./collapsible.tsx";
import Dialog from "./dialog.tsx";
import Drawer from "./drawer.tsx";
import OtpField from "./otp-field.tsx";
import Popover from "./popover.tsx";
import Resizable from "./resizable.tsx";
import Tooltip from "./tooltip.tsx";

export interface Demo extends Entry {
  component: Component;
}

export const demos: Demo[] = [
  // The names of the README's table, in its order.
  { slug: "accordion", label: "Accordion", component: Accordion },
  {
    slug: "alert-dialog",
    label: "Dialog (role alertdialog)",
    component: AlertDialog,
  },
  { slug: "collapsible", label: "Disclosure", component: Disclosure },
  { slug: "dialog", label: "Dialog", component: Dialog },
  { slug: "otp-field", label: "OTP Field", component: OtpField },
  { slug: "popover", label: "Popover", component: Popover },
  { slug: "tooltip", label: "Tooltip", component: Tooltip },
  // What only corvu has a name for.
  { slug: "calendar", label: "Calendar", component: Calendar },
  { slug: "drawer", label: "Drawer", component: Drawer },
  { slug: "resizable", label: "Resizable", component: Resizable },
];
