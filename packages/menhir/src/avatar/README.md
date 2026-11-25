# Avatar

A person's picture, with a fallback such as their initials while the
picture loads and when it fails (#204, part of #150). The picture is a
native `<img>`; what the component adds is the image's loading status,
known to the fallback.

## Sources

In order of precedence (PLAN.md section 8). There is no WAI-ARIA pattern:
the picture is an image, named by its `alt`.

| Source                                                                                                                                                                                                                                                                                                                                                     | Read       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Solid 2.0 idioms: AGENTS.md and `node_modules/solid-js/CHEATSHEET.md` (solid-js 2.0.1): `onSettled` for work once mounted, which does not run on the server; no writes in a component body                                                                                                                                                                 | 2026-11-25 |
| HTML standard, [the `img` element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element): `alt`, and `complete`, true when no image is specified or the current request is completely available or broken; `naturalWidth`, 0 while the image is not available                                                                      | 2026-11-25 |
| HTML standard, [updating the image data](https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data): `load` is fired for an image already in the list of available images, and a new `src` aborts the request in flight; [rendering of images](https://html.spec.whatwg.org/multipage/rendering.html#images-2): a broken image with `alt` | 2026-11-25 |
| Size: PLAN.md section 6                                                                                                                                                                                                                                                                                                                                    | 2026-11-25 |

The standard was read through summaries of the long sections, so each
point the component relies on was also checked in the engines (below).

## The platform first

Checked on 2026-11-25 in Playwright's Chromium, Firefox and WebKit, with a
throwaway page (not kept) that served an image, a missing one, a slow one
and an SVG without a size.

What a plain `<img alt="Jane Doe">` does:

| Case                             | What the browser does                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| It loads                         | Shows the picture; `load`, then `complete` and a `naturalWidth` above 0. An SVG without a size has a `naturalWidth` too (150 in Chromium and WebKit, 300 in Firefox)                                                                             |
| It is cached                     | `complete` right after `src` is set, and `load` still fires                                                                                                                                                                                      |
| It fails                         | `error`, `complete` with a `naturalWidth` of 0. Chromium draws a broken-image icon and the `alt` text, Firefox the `alt` text, both as an inline box that ignores the CSS width, so the layout shifts; WebKit keeps the box and draws a "?" icon |
| Its `src` changes while it loads | Only the new request fires `load` or `error`                                                                                                                                                                                                     |
| It fails with `alt=""`           | Draws nothing, in its CSS box                                                                                                                                                                                                                    |

And what CSS alone can do for a fallback: stack the image over the initials
in one grid cell, so a picture that loads covers them. That is as far as it
goes. No selector matches an image that is loading or has failed, so the
initials cannot wait for a fast picture, they show through a picture with
transparent parts, and a failed image still draws its icon and `alt` text
over them; `alt=""` hides that but takes the name away. The component adds
the status: it takes the failed `<img>` out, takes the fallback out once
the picture has loaded, and puts the status on each part for CSS, which is
enough for the delay. So it is a component, not a recipe.

## Shape

`Avatar.Root` renders a `<span>`, `Avatar.Image` an `<img>` and
`Avatar.Fallback` a `<span>`. Spans, so that an avatar sits inside a link,
a button or a line of text. The parts are exported through a namespace
re-export, and the component imports only `core`.

- **The loading status** is `idle` (no `src`, or no Image), `loading`,
  `loaded` or `error`. Every part carries it as `data-idle`,
  `data-loading`, `data-loaded` or `data-error`, exactly one of them, as
  the `data-*` convention of PLAN.md section 8 has it for a state with
  several values. The Root calls `onLoadingStatusChange(status)` with each
  status it moves to; not with `idle` at the start, which is not a change.
  A change of `src` starts over, at `loading`, until the new picture's
  `load` or `error`. The Image keeps the `src` that last finished, with its
  status, so going straight back to it is `loaded` at once.
- **The Image is rendered while loading or loaded**, not while idle or
  failed: a failed `<img>` would draw the browser's icon and `alt` text
  over the fallback. Its own status comes from its `src` and its events,
  so it is right in the server HTML.
- **The Fallback is rendered until the picture has loaded**, beneath it
  while it loads, so a picture with transparent parts does not show the
  initials through it once it has.
- **Root and Fallback learn the status once the Image is mounted**: the
  Image registers it with the Root in `onSettled` (`core/slot.ts`), as a
  part that another part reads does (PLAN.md section 8, "Generated ids
  belong to the root", for why a later part cannot reach an earlier one in
  the server HTML). So in the server HTML they carry `data-idle` while the
  Image carries `data-loading`, and they agree before the first paint after
  hydration.
- **Before hydration** the image in the server HTML may have loaded or
  failed before any listener was attached. Once mounted, the Image reads
  `complete` and `naturalWidth`: complete with a width is `loaded`, complete
  without one is `error`, and otherwise it waits for the events.
- **The server HTML holds both** the `<img>` and the Fallback, so the
  browser starts the download before any script, and a cached picture
  shows at the first paint. Stacked in one grid cell with the image on top
  (the docs' CSS), the picture covers the initials, there is no flash of
  them over a cached picture, and the box is the Root's size whatever is in
  it, so nothing shifts.
- **The delay before the fallback shows is CSS**, on the Image's
  `data-loading`, which is right in the server HTML:

  ```css
  .avatar-image[data-loading] ~ .avatar-fallback {
    animation: avatar-wait 0s 600ms backwards;
  }
  @keyframes avatar-wait {
    from {
      visibility: hidden;
    }
  }
  ```

  The initials wait 600 ms behind a picture that is loading, and show at
  once when there is none or it fails: the failed `<img>` is taken out, so
  the selector stops matching. `.avatar-fallback[data-loading]` would do
  the same on a page rendered in the browser, but the Fallback says
  `data-idle` in the server HTML, and switching to `data-loading` at
  hydration would start the wait over initials already shown.

- **Do not hide the Image while `data-loading`**, to fade it in: the
  server HTML says `data-loading` for a cached picture too, which would
  then stay hidden until hydration.

## The accessible name

The name is the Image's `alt`, such as the person's name. While the picture
is missing, the Fallback is what is left, and initials are not a name:
"JD" is read as two letters. Give the Fallback the same name with
`role="img"` and `aria-label="Jane Doe"`. While the picture loads, the
`<img>` is already named, so the Fallback beneath it carries
`aria-hidden="true"` and the name is read once. Not in the server HTML,
where the Fallback does not yet know there is a picture (Shape): until
hydration, and on a page without script, the name is read twice, which
loses nothing.

An avatar beside the person's name in text is decorative: `alt=""` on the
Image and `aria-hidden="true"` on the Fallback (the consumer's attribute
wins over the part's own).

## Test list

Every test fails if Solid reports a dev diagnostic while it runs
(`createRenderer`), and `describeConformance` checks each part against the
part conventions. jsdom loads no images, so the tests there fire `load` and
`error` themselves; the cases that load a real image run in Chromium only
(`it.skipIf(isJSDOM)`), with a GIF as a `data:` URL and bytes that are no
image, which the browser fails to decode.

`root/AvatarRoot.test.tsx`

- Renders a `<span>` with its children, `data-idle` with no Image
- `data-loading` once an Image with a `src` is mounted, then `data-loaded` on its `load`, exactly one of the four
- `data-error` on the Image's `error`
- `onLoadingStatusChange` is called with each status it moves to, `loading` then `loaded`, and not with the first `idle`
- `onLoadingStatusChange` is called with `error`, and with `loading` again when `src` changes
- `onLoadingStatusChange` is not called without an Image
- Back to `data-idle` when the Image is removed

`image/AvatarImage.test.tsx`

- Renders an `<img>` with the consumer's `src` and `alt`, `data-loading`, while it loads
- Stays after `load`, with `data-loaded`
- Is removed on `error`
- Renders nothing without a `src`, `undefined` or `""`, and the status is `idle`
- A change of `src` starts over: `loading` after `loaded`, and after `error` an `<img>` with the new `src` is rendered again
- Going straight back to the `src` that last loaded is `loaded` at once
- The consumer's `onLoad` and `onError` run beside the part's own
- Throws a descriptive error outside `Avatar.Root` (PLAN.md section 8)
- A real picture loads: `data-loaded` on every part, and the Fallback is removed (Chromium)
- A real picture fails: `data-error` on the Root and Fallback, and the `<img>` is removed (Chromium)

`fallback/AvatarFallback.test.tsx`

- Renders a `<span>` with its children while idle, loading and failed, carrying the Root's `data-*` attributes as they change, and is removed once loaded
- `aria-hidden="true"` while the picture loads, and not while idle or failed; the consumer's `aria-hidden` wins
- Named by `role="img"` and `aria-label` once the picture has failed, when the `<img>` and its `alt` are gone
- Throws a descriptive error outside `Avatar.Root` (PLAN.md section 8)

`test/avatar/Avatar.hydrate.test.tsx`

- The server HTML holds the `<img>` with its `src`, `alt` and `data-loading` and the Fallback beneath it, and an avatar without a `src` the Fallback alone, before any script runs (PLAN.md section 10)
- Hydration adopts the server's elements without warnings, and the avatar follows its picture loading and its `src` changing afterwards
- A picture that loaded before hydration is `loaded` once hydrated, though its `load` fired before any listener, and the Fallback is removed (Chromium)
- A picture that failed before hydration is an `error` once hydrated: the `<img>` is removed and the Fallback stays (Chromium)

## Left out

| Case                                                              | Reason                                                                                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `delay` prop on the Fallback                                    | CSS on the Image's `data-loading` does it, in the server HTML too, and a prop could not delay the server HTML (Shape)                                            |
| Loading the picture in script first (`new Image()`), then showing | The server HTML would have no `<img>`, so the download would wait for the script, and every page would show the initials first                                   |
| A group of overlapping avatars, a status dot                      | Styling: an element beside or around the Root                                                                                                                    |
| Several Images in one Root                                        | One picture per person. A `<picture>` with sources is the Image's `render` returning `<picture>` around the `<img>` it is given, untested                        |
| A change of `srcset`, `sizes` or `crossorigin` alone              | It does not start over at `loading`: the status follows `src`. The browser's `load` or `error` for the new choice still sets it                                  |
| A broken image's look before hydration                            | Until hydration takes it out, a picture that failed draws the browser's icon over the initials, as in the table above. Not a part's to change: no script has run |
| Keyboard behaviour                                                | An avatar is not focusable and takes no input; inside a link or a button, that element is the one focused                                                        |
| A development warning for an Image without `alt`                  | The `<img>` is the consumer's, and `alt=""` is a valid choice for a decorative avatar; the docs say what to pass                                                 |

## Browsers and screen readers

The tests run in jsdom and in Chromium through Playwright. The platform
behaviour above was checked in Playwright's Chromium, Firefox and WebKit.
Screen readers and real devices have not been tried yet: that needs
a person (#214).
