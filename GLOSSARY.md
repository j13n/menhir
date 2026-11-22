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

**Scroll lock**:
While a modal popup is open, the page behind it does not scroll.
_Avoid_: Body lock, scroll block, no-scroll

**Dismiss**:
To close a popup from outside it: Escape, an outside press, or another close request from the browser, such as the back gesture on Android.
_Avoid_: Hide (for a dismissal), cancel

**Outside press**:
A press outside a popup that dismisses it: on a dialog's backdrop, or anywhere outside a popover. It counts on release, and only if the press also started outside.
_Avoid_: Click outside, interact outside, pointer down outside

**Leaving**:
Of a popup: closed, but still shown while its exit animations run. It takes no focus and no press, and is hidden once they have ended.
_Avoid_: Exiting, unmounting, closing (for this phase)

**Hover delay**:
How long the pointer rests on a trigger before its popup opens (`delay`), or how long after it has left before the popup closes (`closeDelay`).
_Avoid_: Hover intent (for the delay alone), debounce

**Safe area**:
The space between where the pointer left a trigger and its popup, or the popup and its trigger, that the pointer may cross without the popup closing.
_Avoid_: Safe triangle, safe polygon, hover bridge

**Delay group**:
Triggers whose popups open at once, without the hover delay, while one of them is open or shortly after it closed, such as the tooltips of a toolbar.
_Avoid_: Tooltip provider, delay provider

**Tab stop**:
An element that Tab moves focus to. A radio group is one tab stop, however many radios it has.
_Avoid_: Tabbable (as a noun), focus stop

**Tab wrap**:
In a modal popup, Tab from the last tab stop moving to the first, and Shift+Tab from the first to the last, so focus stays inside.
_Avoid_: Focus trap, focus lock, focus loop
