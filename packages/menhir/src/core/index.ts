// The `core` layer (PLAN.md section 6). Internal only: it is not listed in
// `exports`. Components import each helper from its own module, so a
// component's bundle holds only the helpers it uses:
//
// - mergeElementProps.ts: a part's own props merged with the consumer's.
// - renderElement.tsx: a part's element, or the consumer's `render`.
// - createControllableSignal.ts: a controlled/uncontrolled value.
// - listValue.ts: a controlled/uncontrolled value that lists items, one at
//   a time or several, shared by Toggle Group and Accordion.
// - button.ts: the props type and dev warning of a part that is a native
//   button, and the own props of one that flips a state it announces in
//   `aria-pressed` or `aria-expanded`, shared by Toggle, Toggle Group and
//   Collapsible.
// - rovingFocus.ts: one tab stop among a group's items, with arrow keys
//   between them, shared by Toggle Group and Tabs.
// - range.ts: the value, attributes and text of a part along a range,
//   shared by Progress and Meter.
// - toggleButton.ts: the own props of a part that is a toggle button
//   (`aria-pressed` and `data-pressed`), shared by Toggle and Toggle Group.
// - preference/: a reader's choice saved in `localStorage` or a cookie and
//   applied to `<html>`, with its pre-paint head script. What the
//   color-scheme and theme utilities share.
//
// Ids need no helper: parts call Solid's `createUniqueId`, which matches
// between the server render and hydration (test/core/ids.hydrate.test.tsx).
export {};
