// The `core` layer (PLAN.md section 6). Internal only: it is not listed in
// `exports`. Components import each helper from its own module, so a
// component's bundle holds only the helpers it uses:
//
// - mergeElementProps.ts: a part's own props merged with the consumer's.
// - renderElement.tsx: a part's element, or the consumer's `render`.
// - createControllableSignal.ts: a controlled/uncontrolled value.
// - button.ts: the props type and dev warning of a part that is a native
//   button.
// - range.ts: the value, attributes and text of a part along a range,
//   shared by Progress and Meter.
// - toggleButton.ts: the own props of a part that is a toggle button,
//   shared by Toggle and Toggle Group.
// - preference/: a reader's choice saved in `localStorage` or a cookie and
//   applied to `<html>`, with its pre-paint head script. What the
//   color-mode and theme utilities share.
//
// Ids need no helper: parts call Solid's `createUniqueId`, which matches
// between the server render and hydration (test/core/ids.hydrate.test.tsx).
export {};
