# Manual test: scroll lock on a device

Pages that compare how dialogs lock the page's scroll, for trying on a phone
(#114). Each page renders the same tall page and the same dialog: some text,
an input, a scrollable area, and a switch that makes the dialog taller than
the screen. Menhir's page uses the test Dialog of
`packages/menhir/test/floating/scroll-lock/`; the others use each library's
dialog with its defaults. This compares behaviour; no code of theirs is
copied.

| Page    | Library                                 | Package                  |
| ------- | --------------------------------------- | ------------------------ |
| Menhir  | `floating/scroll-lock`, Solid 2         | `menhir/` (port 5180)    |
| Radix   | `@radix-ui/react-dialog` 1.3, React 19  | `libraries/` (port 5181) |
| Base UI | `@base-ui/react` 1.9 `Dialog`, React 19 | `libraries/`             |
| Kobalte | `@kobalte/core` 0.13 `Dialog`, Solid 1  | `libraries/`             |
| corvu   | `corvu` 0.7 `Dialog`, Solid 1           | `libraries/`             |

Two packages, because one cannot depend on both Solid 1 and Solid 2. The
yellow bar and the page styles are shared (`shared/`). The libraries' pages
are left out of lint (`oxlint.config.ts`): the repo's rules are for Solid 2.

## Run

From the repo root:

```sh
pnpm --filter "./test/manual/scroll-lock/*" --parallel dev
```

Then open `http://<this computer's address on the local network>:5181/` on
the phone, on the same Wi-Fi. The address is the `Network` line the
servers print. The bar on every page links to the others.

## The bar

- `scrollY`: the page's scroll position. The page under the dialog must not
  scroll, so it must not change while the dialog is open.
- `html style`, `body style`: what the library wrote there, and the `data-`
  attributes on `<body>`.
- `popup touch-action`, `overscroll`: the dialog's computed values.
- `pan`, `zoom`: how far the visible area has moved over the page, and the
  zoom level. The on-screen keyboard and pinch zoom change them without
  scrolling the page.
- `LONG dialog`: a dialog taller than the screen, which scrolls itself.

## Steps

Scroll down to "Dialog trigger", below row 12, note `scrollY`, and open the
dialog.

1. Drag on the backdrop. Does `scrollY` change?
2. Drag in the scrollable area. Does it scroll?
3. Drag on the dialog's plain text. Does `scrollY` change?
4. Tap the input so the keyboard opens, then drag on the backdrop and on the
   text, also until the dialog reaches its end. Does `scrollY` change?
   Ignore the jump when the input is first focused.
5. Pinch to zoom in, then drag with one finger and with two. What pans, and
   does `scrollY` change?
6. Close the dialog. Is `scrollY` where it was, and does the page scroll?
7. With `LONG dialog`: can the dialog be scrolled to its end? The dialog
   covers the bar, so compare `scrollY` before opening and after closing.

## Results

Menhir's, from #28: `floating/scroll-lock/README.md`, "iOS Safari". Write
each result as the step's answer, with the device, the iOS version and the
date.

| Page    | Browser | 1   | 2   | 3            | 4   | 5               | 6   | 7   |
| ------- | ------- | --- | --- | ------------ | --- | --------------- | --- | --- |
| Menhir  | Safari  | No  | Yes | No           | No  | Two fingers pan | Yes | Yes |
| Menhir  | Chrome  | No  | Yes | Page scrolls |     |                 |     |     |
| Radix   | Safari  |     |     |              |     |                 |     |     |
| Radix   | Chrome  |     |     |              |     |                 |     |     |
| Base UI | Safari  |     |     |              |     |                 |     |     |
| Base UI | Chrome  |     |     |              |     |                 |     |     |
| Kobalte | Safari  |     |     |              |     |                 |     |     |
| Kobalte | Chrome  |     |     |              |     |                 |     |     |
| corvu   | Safari  |     |     |              |     |                 |     |     |
| corvu   | Chrome  |     |     |              |     |                 |     |     |

Menhir's rows: iPhone 17, iOS 26.5.1, 2026-11-22.

What each writes while open, in Chromium on 2026-11-22:

| Page    | `<html>`           | `<body>`                                     | Dialog                                                     |
| ------- | ------------------ | -------------------------------------------- | ---------------------------------------------------------- |
| Menhir  | `overflow: hidden` |                                              | `touch-action: pinch-zoom`, `overscroll-behavior: contain` |
| Radix   |                    | `pointer-events: none`, `data-scroll-locked` |                                                            |
| Base UI |                    | `overflow: hidden`                           |                                                            |
| Kobalte | `overflow: hidden` | `pointer-events: none`                       |                                                            |
| corvu   | `overflow: hidden` | `pointer-events: none`                       |                                                            |

Styles alone do not tell the whole technique: a library may also listen for
`touchmove` or `wheel`, which the bar cannot show.
