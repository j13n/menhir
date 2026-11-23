export * as Combobox from "./index.parts.ts";
// Its own import, so that an app that filters otherwise does not bundle it
// (README, "Filtering is the consumer's").
export { includesText } from "./filter/includesText.ts";
