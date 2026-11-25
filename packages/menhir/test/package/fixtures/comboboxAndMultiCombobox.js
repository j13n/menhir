// An app that uses every part of Combobox and of Multi Combobox. Imports
// the compiled output, which is what a bundler without the `solid`
// condition gets.
import { Combobox, includesText } from "../../../dist/combobox/index.js";
import { MultiCombobox } from "../../../dist/multi-combobox/index.js";

console.log(Combobox, MultiCombobox, includesText);
