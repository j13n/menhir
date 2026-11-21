# Separator

A line that divides sections of content or groups of items: the static
`separator` role of WAI-ARIA.

## Sources

| Source                                                                         | Read       |
| ------------------------------------------------------------------------------ | ---------- |
| [WAI-ARIA 1.2 `separator` role](https://www.w3.org/TR/wai-aria-1.2/#separator) | 2026-11-21 |

The WAI-ARIA Authoring Practices have no pattern for a static separator; the
role's definition is the source. Its focusable variant is the window
splitter, a separate widget (below, "Left out").

## Shape

`Separator.Root` renders a `<div role="separator">` with `aria-orientation`,
the only part. A static separator is a structural element: it is not
focusable, takes no input and needs no script, so it works the same in the
server HTML before hydration.

- **A `<div>`, not an `<hr>`.** `<hr>` has the role natively, but browsers
  draw it with an inset border and margins, which an unstyled part would have
  to undo, and draw it horizontally even when it is vertical. A consumer who
  wants an `<hr>` renders one with `render`, and the explicit role is then
  redundant but harmless.
- **`aria-orientation` is always written**, `"horizontal"` (the role's
  implicit value) or `"vertical"`, so the attribute a style selects on is
  always there. Set it with `orientation`: a consumer's `aria-orientation`
  replaces the part's own, as any attribute does (PLAN.md section 8), but
  the `data-*` attributes do not follow it.
- **`data-horizontal`/`data-vertical`**: exactly one applies, following the
  `data-*` convention of PLAN.md section 8 for a state with two values, as
  `data-pressed`/`data-unpressed` do.
- **No name is required.** The role takes its name from the author;
  `aria-label` and `aria-labelledby` pass through.

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks the part against the
part conventions. "A" marks a case the WAI-ARIA role requires.

`root/SeparatorRoot.test.tsx`

- Renders a `<div>` with role `separator` (A: role)
- Horizontal by default: `aria-orientation="horizontal"` (A: implicit orientation)
- `orientation="vertical"` gives `aria-orientation="vertical"` (A: orientation)
- `data-horizontal`/`data-vertical`, exactly one of them
- Follows `orientation` changing while rendered, in `aria-orientation` and the `data-*` attributes
- Not focusable: Tab moves past it (A: a static separator is not a widget)
- `aria-label`, `aria-labelledby` and `aria-describedby` pass through (A: name from author)
- The consumer's attributes override the part's own, shown with `aria-orientation`
- `render` with an `<hr>` keeps the role and orientation (PLAN.md "Polymorphism")

`test/separator/Separator.hydrate.test.tsx`

- The server HTML has both separators with their role, `aria-orientation` and `data-*` attributes before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and a separator follows `orientation` changing afterwards

## Left out

| Case                                                                                                                              | Reason                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A focusable separator: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, `aria-disabled` and keyboard resizing | The window splitter pattern, a widget that resizes the panes it divides. It needs pointer and keyboard handling every static separator would pay for (PLAN.md section 6, rule 6), so it belongs to a component of its own |
| Keyboard behaviour                                                                                                                | A static separator is not focusable and takes no input                                                                                                                                                                    |
| Content inside the separator, which the role makes presentational                                                                 | Assistive technologies, not the DOM, decide that children are not read, so a test cannot observe it. The part passes children through, and the docs show it empty                                                         |
| An orientation other than `horizontal` or `vertical`                                                                              | `aria-orientation` also allows `undefined`, which for this role means horizontal, the default                                                                                                                             |
| An orientation inferred from the parent, such as vertical in a horizontal toolbar                                                 | Comes with Toolbar and Menu, whose parts set the separator's orientation                                                                                                                                                  |
| Generated ids                                                                                                                     | The separator takes the consumer's `id`, and no part links to another                                                                                                                                                     |
