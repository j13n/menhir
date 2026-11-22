# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, and the few utilities that keep a reader's display choices.

## Language

### Display choices

**Color scheme**:
The reader's choice of light, dark or system, where system follows the operating system's preference.
_Avoid_: Color mode, appearance, dark mode (as the name of the choice)

**Theme**:
A named look out of the app's list, such as sepia or high contrast, whether it is light or dark.
_Avoid_: Palette, skin, color scheme

### Popups

**Popup**:
Content shown above the page while it is open, and gone again when it closes: a dialog, a popover, a tooltip or a menu.
_Avoid_: Overlay, floating element, layer, portal

**Trigger**:
The element a popup opens from: the button that opens a dialog, or the element a tooltip describes.
_Avoid_: Invoker, activator, toggle, opener

**Anchor**:
What a positioned popup is placed against, usually its trigger.
_Avoid_: Reference, reference element, target

**Side**:
The edge of the anchor a positioned popup is placed against: top, right, bottom or left.
_Avoid_: Placement (for the side alone), position

**Alignment**:
Where along its side a positioned popup sits against the anchor: start, center or end, following the writing direction.
_Avoid_: Placement (for the alignment alone), justify

**Modal**:
Of a popup: the rest of the page cannot be reached while it is open. A popup that is not modal leaves the page usable.
_Avoid_: Blocking; "a modal" as a noun for a dialog

**Backdrop**:
The layer that covers the rest of the page behind a modal popup.
_Avoid_: Overlay, scrim, underlay, mask

**Dismiss**:
To close a popup from outside it: Escape, an outside press, or another close request from the browser, such as the back gesture on Android.
_Avoid_: Hide (for a dismissal), cancel

**Outside press**:
A press outside a popup that dismisses it: on a dialog's backdrop, or anywhere outside a popover. It counts on release, and only if the press also started outside.
_Avoid_: Click outside, interact outside, pointer down outside
