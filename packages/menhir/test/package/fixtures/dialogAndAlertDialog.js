// An app that uses every part of Dialog and of Alert Dialog. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { AlertDialog } from "../../../dist/alert-dialog/index.js";
import { Dialog } from "../../../dist/dialog/index.js";

console.log(Dialog, AlertDialog);
