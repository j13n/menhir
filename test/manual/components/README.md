# Manual test: the same components in four libraries

Four small Vite apps, one per library, each rendering that library's
components with its defaults. They are something to hold next to Menhir
when testing by hand: with a screen reader, a keyboard, a phone. This
compares behaviour; no code of theirs is copied.

| App     | Library                    | Framework | Folder               | Port |
| ------- | -------------------------- | --------- | -------------------- | ---- |
| Kobalte | `@kobalte/core` 0.13       | Solid 1   | `libraries/kobalte/` | 5191 |
| corvu   | `corvu` 0.7                | Solid 1   | `libraries/corvu/`   | 5192 |
| Base UI | `@base-ui/react` 1.9       | React 19  | `libraries/base-ui/` | 5193 |
| Radix   | `radix-ui` 1.8 (all parts) | React 19  | `libraries/radix/`   | 5194 |

Every app shows one component per page, `/?c=<name>`, so a screen reader
meets only the shell and that component, and reloading gives a fresh start.
The name is the same in every app: `http://localhost:5191/?c=dialog` is
Kobalte's dialog and `http://localhost:5194/?c=dialog` is Radix's. The first
row of links in the shell switches library and keeps the component; the
second lists what this library has, under the library's own names. A library
without the component says so.

The shell (`shared/shell.ts`), the styles (`shared/page.css`) and the words
(`shared/content.ts`) are shared. The apps are left out of lint
(`oxlint.config.ts`): the repo's rules are for Solid 2.

## Run

From the repo root, all four:

```sh
pnpm --filter "./test/manual/components/libraries/*" --parallel dev
```

One of them:

```sh
pnpm --filter @menhir/manual-components-radix dev
```

Or in containers, with nothing installed but Docker:

```sh
docker compose -f test/manual/components/compose.yaml up --build
```

`up --build kobalte radix` starts only those two. The containers serve the
files of this folder, so an edit to a demo shows without a rebuild; a change
to a `package.json` needs `--build`.

For a phone or another computer on the same network, use this computer's
address instead of `localhost`; the shell's links follow.

`pnpm --filter "./test/manual/components/libraries/*" check` typechecks the
apps. CI does not.

## What each page renders

One name per component, Menhir's, whatever the library calls it. Each page
renders the content below as far as the library has the part, with the same
words, so that what differs is the library. A part a library lacks is left
out, not rebuilt by hand. A variant gets its own `<h2>`.

| Name              | Content                                                                                                                                                                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`       | Items "Shipping" ("Orders ship within two working days."), "Returns" ("You can return an item within thirty days."), "Warranty" (disabled, "Every item has a two-year warranty."), headers as `<h3>`; one open at a time, "Shipping" open at first. Second variant "Multiple": the same, several open at once. |
| `alert-dialog`    | Trigger "Delete account". Title "Delete account?", description "This cannot be undone.", buttons "Cancel" and "Delete".                                                                                                                                                                                        |
| `autocomplete`    | Label "Search fruit", a text input that suggests `fruits`; the value is free text.                                                                                                                                                                                                                             |
| `avatar`          | One with `avatarImage` (alt "Janusz Oppermann") and fallback "JO"; one whose image is `brokenImage`, showing "JO".                                                                                                                                                                                             |
| `checkbox`        | "Accept terms"; "Select all", indeterminate at first; "Subscribe", disabled.                                                                                                                                                                                                                                   |
| `checkbox-group`  | Group "Toppings": "Cheese" (checked), "Mushrooms", "Olives" (disabled).                                                                                                                                                                                                                                        |
| `collapsible`     | Trigger "Show details", content "Order 1042 shipped on Monday."                                                                                                                                                                                                                                                |
| `combobox`        | Label "Fruit", placeholder "Pick a fruit", options `fruits`, `disabledFruit` disabled, filtered while typing, "No fruit found" when empty, one value.                                                                                                                                                          |
| `context-menu`    | Area "Right-click here". Items "Cut", "Copy", "Paste" (disabled), a separator, checkbox item "Show grid", submenu "Share" with "Email" and "Link".                                                                                                                                                             |
| `dialog`          | Trigger "Edit profile". Title "Edit profile", description "Change your display name.", input labelled "Name", buttons "Save" (closes) and "Close". Second variant "Non-modal" if the library has one.                                                                                                          |
| `field`           | Label "Email", `type="email"`, required, description "We only use it for receipts.", an error message when invalid.                                                                                                                                                                                            |
| `fieldset`        | Legend "Address", with fields "Street" and "City".                                                                                                                                                                                                                                                             |
| `form`            | "Name" (required) and "Email" (required, `type="email"`), a "Submit" button, the library's error messages; after a valid submit, the text "Submitted" in a `role="status"` element.                                                                                                                            |
| `input`           | Label "Name", a text input; label "Comment", a textarea, if the library has one.                                                                                                                                                                                                                               |
| `menu`            | Trigger "Actions". Items "New file", "Open" (disabled), a separator, checkbox item "Word wrap", a group labelled "Theme" with radio items "Light" (checked) and "Dark", submenu "Export" with "PDF" and "PNG".                                                                                                 |
| `menubar`         | "File": "New", "Open", "Save". "Edit": "Undo", "Redo" (disabled). "View": checkbox item "Sidebar".                                                                                                                                                                                                             |
| `meter`           | Label "Storage", 60 of 100, value text "60 GB of 100 GB".                                                                                                                                                                                                                                                      |
| `multi-combobox`  | Label "Fruits", options `fruits`, several values, shown as removable chips if the library has them.                                                                                                                                                                                                            |
| `navigation-menu` | "Products" with links "Analytics" and "Reports"; "Company" with links "About" and "Careers"; a plain link "Docs". Links go to `#`.                                                                                                                                                                             |
| `number-field`    | Label "Quantity", 0 to 10, step 1, 2 at first, with decrement and increment buttons.                                                                                                                                                                                                                           |
| `otp-field`       | Label "Verification code", six digits.                                                                                                                                                                                                                                                                         |
| `popover`         | Trigger "Notifications". Title "Notifications", description "You have no new messages.", a "Close" button.                                                                                                                                                                                                     |
| `preview-card`    | The sentence "Built with @menhir.", "@menhir" a link; the card says "Menhir: unstyled components for Solid 2."                                                                                                                                                                                                 |
| `progress`        | Label "Uploading", 40 of 100. Second variant "Indeterminate": label "Loading".                                                                                                                                                                                                                                 |
| `radio`           | Group "Plan": "Free" (checked), "Pro", "Enterprise" (disabled).                                                                                                                                                                                                                                                |
| `scroll-area`     | `lines` in a `.scroll` box.                                                                                                                                                                                                                                                                                    |
| `select`          | Label "Fruit", placeholder "Pick a fruit", options `fruits`, `disabledFruit` disabled. Second variant "Grouped" if the library has groups: "Citrus" with "Lemon", "Lime"; "Berries" with "Raspberry", "Blueberry". Third "Multiple" if it can.                                                                 |
| `separator`       | Horizontal, between "Above the separator." and "Below the separator."; vertical, between links "Home" and "About" in a `.row`.                                                                                                                                                                                 |
| `slider`          | Label "Volume", 0 to 100, 30 at first. Second variant "Range": label "Price", thumbs at 20 and 80. Third "Vertical" if it can.                                                                                                                                                                                 |
| `switch`          | "Airplane mode"; "Bluetooth", disabled.                                                                                                                                                                                                                                                                        |
| `tabs`            | Tabs "Account", "Password", "Billing" (disabled); panels "Change your name and email address here.", "Choose a new password here.", "See your invoices here." Second variant "Vertical".                                                                                                                       |
| `toast`           | Button "Show toast": title "Saved", description "Your changes were saved.", a "Close" button. Button "Show error toast" if the library has priorities or types: title "Failed", description "Could not save."                                                                                                  |
| `toggle`          | "Bold", off at first.                                                                                                                                                                                                                                                                                          |
| `toggle-group`    | Group "Text alignment": "Left" (on), "Center", "Right", one at a time. Second variant "Multiple": "Bold", "Italic", "Underline".                                                                                                                                                                               |
| `toolbar`         | Label "Formatting": buttons "Bold" and "Italic", a separator, a link "Help", and a toggle group "Left", "Center", "Right" if the toolbar has one.                                                                                                                                                              |
| `tooltip`         | Button "Save" with tooltip "Save the document". A second, disabled button "Publish" with tooltip "Nothing to publish", if the library shows tooltips on disabled triggers.                                                                                                                                     |

A component Menhir has no name for keeps the library's own name, lower case
with hyphens (`drawer`, `pagination`, `color-area`), and renders the
library's basic example.

## Styles

`shared/page.css` has just enough to see what is going on. Parts take these
classes in every app:

| Class                              | For                                                               |
| ---------------------------------- | ----------------------------------------------------------------- |
| `backdrop`, `dialog`               | a modal's overlay and its centred box                             |
| `popup`, `popup padded`            | a floating list (menu, listbox); a floating box with text         |
| `tooltip`                          | a tooltip                                                         |
| `item`, `group-label`, `separator` | a row in a menu or listbox, a group's label, a separator anywhere |
| `toggle`, `tab`, `panel`           | a button that stays down, a tab, a tab's panel                    |
| `box`, `box round`, `dot`          | a checkbox's square, a radio's circle, the radio's indicator      |
| `switch`, `switch-thumb`           | a switch                                                          |
| `slider`, `track`, `fill`, `thumb` | a slider; `track` and `fill` also for progress and meter          |
| `scroll`, `avatar`, `target`       | a scroll area, an avatar, a context menu's area                   |
| `toasts`, `toast`                  | the toast region and one toast                                    |
| `row`, `stack`, `error`, `hint`    | layout, an error message, a description                           |

What only one library needs goes in that app's `src/app.css`.

## Where a page is more than the library's defaults

Read a difference on these pages as the page's, not the library's.

- Kobalte
  - `field`: Kobalte validates nothing; the page sets
    `validationState="invalid"` from the input's validity on blur.
  - `autocomplete` (Search): the page filters `fruits` itself and adds
    `Search.NoResult`.
  - `toast`: "Saved" has `priority="low"`; "Failed" has the default, `high`.
  - `dialog`, `alert-dialog`: every button is a `CloseButton`. Both are
    imported as `* as Dialog`: `Dialog` and `AlertDialog` are one object, and
    with both in a bundle `Dialog.Content` has the alert dialog's role.
  - `toggle-group` and `listbox` have no label part; their captions are
    plain text.
- corvu
  - `alert-dialog` is `Dialog` with `role="alertdialog"`.
  - "Save" and "Delete" are plain buttons that set `open`. `Dialog.Close`
    has `aria-label="close"` built in, whatever its text.
  - `otp-field`: the label is a `<label for>`; the page draws the six slots.
  - `calendar`: `abbr` on the weekday cells, as in corvu's docs.
- Base UI
  - `field`: `validationMode="onBlur"`; the default, `onSubmit`, needs a
    form.
  - `combobox`, `multi-combobox`: a native `<label>`, no Trigger or Clear,
    and `aria-label="Remove <fruit>"` on a chip's button.
  - `checkbox-group`, `radio`: `aria-labelledby` to the caption.
    `toggle-group`, `toolbar`: `aria-label`.
  - `tooltip`: the disabled trigger is `focusableWhenDisabled`.
  - `sideOffset={6}` on the popover, tooltip, preview card and navigation
    menu.
  - Left bare: the OTP inputs after the first, and the range slider's
    thumbs, which Base UI's docs give an `aria-label` each.
- Radix
  - Where Radix has no label part the page names the control as Radix's
    docs do: `aria-label` on slider thumbs, the toolbar and the toggle
    groups; `aria-labelledby` on the radio group, the progress bars and the
    OTP field; `Label` for the rest.
  - `toast`: "Show toast" is `type="background"`; the error toast has the
    default, `foreground`.
  - `menu`: the checkbox and radio items are controlled; Radix has no
    uncontrolled form.
  - `popover`: Radix has no title or description part; they are an `<h3>`
    and a `<p>`.

In Kobalte, Base UI and Radix, "Select all" in `checkbox` is controlled,
indeterminate until its first change.

## Not here

| Library | Shared names it has no component for                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| Kobalte | `checkbox-group`, `fieldset`, `form`, `otp-field`, `scroll-area`, `toolbar`                                  |
| corvu   | all but `accordion`, `alert-dialog`, `collapsible`, `dialog`, `otp-field`, `popover`, `tooltip`              |
| Base UI | none                                                                                                         |
| Radix   | `autocomplete`, `checkbox-group`, `combobox`, `fieldset`, `input`, `meter`, `multi-combobox`, `number-field` |

The apps have been loaded in Chromium, page by page, with no console
errors (2026-11-27). No screen reader has been run against them yet.
