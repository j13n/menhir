// An app that uses every part of Menu and of Context Menu. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { ContextMenu } from "../../../dist/context-menu/index.js";
import { Menu } from "../../../dist/menu/index.js";

console.log(Menu, ContextMenu);
