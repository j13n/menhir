// The `core` layer (PLAN.md section 6). Internal only: it is not listed in
// `exports`. Components import each helper from its own module, so a
// component's bundle holds only the helpers it uses:
//
// - mergeElementProps.ts: a part's own props merged with the consumer's.
// - renderElement.tsx: a part's element, or the consumer's `render`.
// - createControllableSignal.ts: a controlled/uncontrolled value.
//
// Ids need no helper: parts call Solid's `createUniqueId`, which matches
// between the server render and hydration (test/core/ids.hydrate.test.tsx).
export {};
