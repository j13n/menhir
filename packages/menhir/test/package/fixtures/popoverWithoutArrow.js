// An app that uses every part of Popover but the Arrow. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { Popover } from "../../../dist/popover/index.js";

console.log(
  Popover.Root,
  Popover.Trigger,
  Popover.Popup,
  Popover.Title,
  Popover.Description,
  Popover.Close,
);
