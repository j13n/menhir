// An app that uses every part of Tooltip but the Group. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { Tooltip } from "../../../dist/tooltip/index.js";

console.log(Tooltip.Root, Tooltip.Trigger, Tooltip.Popup, Tooltip.Arrow);
