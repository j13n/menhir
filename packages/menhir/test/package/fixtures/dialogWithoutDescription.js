// An app that uses every part of Dialog but the Description. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { Dialog } from "../../../dist/dialog/index.js";

console.log(
  Dialog.Root,
  Dialog.Trigger,
  Dialog.Popup,
  Dialog.Title,
  Dialog.Close,
);
