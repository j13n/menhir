export * as MultiCombobox from "./index.parts.ts";
// Combobox's, its own import, so that an app that filters otherwise does
// not bundle it (../combobox/README.md, "Filtering is the consumer's").
export { includesText } from "../combobox/filter/includesText.ts";
