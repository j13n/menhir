// An app that uses every part of Combobox and of Autocomplete. Imports the
// compiled output, which is what a bundler without the `solid` condition
// gets.
import { Autocomplete } from "../../../dist/autocomplete/index.js";
import { Combobox, includesText } from "../../../dist/combobox/index.js";

console.log(Combobox, Autocomplete, includesText);
