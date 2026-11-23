// An app that uses every part of Menu and of Menubar. Imports the compiled
// output, which is what a bundler without the `solid` condition gets.
import { Menu } from "../../../dist/menu/index.js";
import { Menubar } from "../../../dist/menubar/index.js";

console.log(Menu, Menubar);
