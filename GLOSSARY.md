# Menhir

Unstyled, accessible UI primitives for SolidJS 2.0, and the few utilities that keep a reader's display choices.

## Language

### Display choices

**Color scheme**:
The reader's choice of light, dark or system, where system follows the operating system's preference.
_Avoid_: Color mode, appearance, dark mode (as the name of the choice)

**Theme**:
A named set of colours out of the app's list, such as sepia or high contrast, whether it is light or dark.
_Avoid_: Palette, skin, color scheme

### Popups

**Popup**:
Content shown above the page while it is open, and gone again when it closes: a dialog, a popover, a tooltip or a menu.
_Avoid_: Overlay, floating element, layer, portal

**Panel**:
Content in the page's flow that a Trigger shows and hides, `hidden` while closed: a Collapsible's, an Accordion's, a Navigation Menu's. Unlike a Popup, it is not in the top layer; the consumer's CSS places it.
_Avoid_: Content, dropdown, popup (for a Panel)

**Trigger**:
The element a popup or a Panel opens from: the button that opens a dialog or a menu, the area a context menu opens from, the item of a menubar that opens its menu, the item that opens a submenu, the button beside a combobox's input that opens its list, the element a tooltip describes, or the button that shows a Collapsible's, an Accordion's or a Navigation Menu's Panel.
_Avoid_: Invoker, activator, toggle, opener

**Anchor**:
What a positioned popup is placed against, usually its trigger.
_Avoid_: Reference, reference element, target

**Arrow**:
The part of a positioned popup that points at the middle of its anchor, on the popup's edge that faces it.
_Avoid_: Caret, pointer, tip, beak

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
The layer that covers the rest of the page behind a modal popup. It is the browser's `::backdrop`, not a part.
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

**Active item**:
The item of a list popup that the keyboard acts on: focused in a menu, or named in `aria-activedescendant` by a select's Trigger or a combobox's input, which keeps focus. It carries `data-active`, and none is active while the popup is closed.
_Avoid_: Highlighted item, current item, focused item (it may not have focus), selected item (a selection is a value)

**Submenu**:
A menu that an item of another menu opens: its Popup is the sibling right after that item, Escape closes it alone, and activating an item in it closes every menu.
_Avoid_: Nested menu, child menu, flyout, cascading menu

**Menubar**:
A row of menus that stays on screen, one tab stop, whose items each open a menu: once one is open, moving to another item opens that one. For an application's commands; links to a site's pages are a Navigation Menu.
_Avoid_: Menu bar, toolbar (a toolbar holds buttons, not menus), top menu

**Activate**:
To use an item of a menu, by a click, Enter or Space: it calls its `onClick` and closes every open menu.
_Avoid_: Select (a selection is a value), choose, trigger (as a verb)

**Select** (the verb):
To make an item of a select or a combobox its value, by a click, Enter, Space or Tab on a select, a click or Enter on a combobox: the list closes. Moving the active item selects nothing.
_Avoid_: Activate (a menu's), pick, choose, check (a checkbox item's)

**Selected item**:
The item whose `value` is the select's or the combobox's value. It carries `data-selected` and `aria-selected="true"`, and stays selected while the list is closed.
_Avoid_: Active item (the keys' position), current item, checked item

**Input value**:
The text in a combobox's input, apart from its value: what the user typed, or the selected item's label. The form receives the value, not the text. An autocomplete has no input value apart from its value: its value is the text.
_Avoid_: Query (the app's filter, which follows the text only while the user types), search term, input text

**Accept**:
To put a suggestion's `value` in an autocomplete's input, by a click or Enter: the list closes. It leaves no selected item, since an autocomplete's value is its text.
_Avoid_: Select (a combobox's, which sets a value apart from the text), pick, choose

**Base popup**:
The popup another popup builds on, whose parts it re-exports: Dialog is Alert Dialog's (#32), Menu is Context Menu's (#100) and Menubar's (#101), and Combobox is Autocomplete's (#104). The only popup it may import (PLAN.md section 6, rule 4).
_Avoid_: Parent popup, super-component

### Popup parts

The parts every popup is built from, as `Dialog.Root`, `Dialog.Trigger` and so on (#31).

**Root**:
The part that holds a component's state and shares it with the other parts. A popup's Root holds whether it is open and renders no element. Navigation Menu's Root renders a `<nav>`: it is the landmark, and the boundary that focus leaving and a press outside are measured against.
_Avoid_: Provider, container, wrapper

**Popup** (the part):
The element the browser shows in the top layer: a `<dialog>` for a dialog, a `popover` element otherwise.
_Avoid_: Content, panel, positioner

**Title**:
The heading that names a popup, through the Popup's `aria-labelledby`.
_Avoid_: Label, heading, header

**Description**:
The text that says what a popup is for, through the Popup's `aria-describedby`.
_Avoid_: Body, subtitle

**Close**:
A button inside a popup that closes it.
_Avoid_: Dismiss button, cancel (as the part's name)

**Item**:
An entry of a list popup that the keys move through: a menu's action, checkbox or radio option, or a submenu's trigger, which does something when activated, a select's or a combobox's entry, which is selected, or an autocomplete's suggestion, which is accepted. A select's, a combobox's or an autocomplete's Item has the `option` role. Outside popups, one control of a group that holds one value: a Toggle Group's toggle button, a Checkbox Group's checkbox, a Radio's radio button.
_Avoid_: Option (as the part's name), entry, row, menu entry

**List** (the part):
The `listbox` inside a combobox's Popup, which holds its items; the Popup around it also holds a Status or a loading message.
_Avoid_: Listbox (as the part's name), options, menu

**Status** (the part):
A combobox's live region, which says the number of items in the app's words while the list is open: a message for an empty list, or a count for a screen reader.
_Avoid_: Empty (it says more than that), live region (as the part's name), announcer

**Value** (the part):
The part inside a select's Trigger that shows the selected item's label, or a placeholder while none is selected.
_Avoid_: Selected value, label, display value

### Forms

**Field**:
A form control together with its label, description and error message, and its validity (#141). It holds no value.
_Avoid_: Form control (for the whole), form item, form group

**Control** (the part):
The element the user fills in or changes inside a Field: an `<input>`, a `<textarea>`, a `<select>` or a Menhir control such as a Switch or a Select's Trigger.
_Avoid_: Input (for any control), widget

**Input** (the component):
A native text `<input>` whose value can be controlled, `menhir/input` (#142). It joins a Field as a Control, through `Field.Control`'s `render`.
_Avoid_: Text field (for the component), Input (for any control)

**Checkbox Group**:
Several checkboxes that hold one list of values, `menhir/checkbox-group` (#146): a `<fieldset>` around Items, each a Checkbox with a `value`, checked while the list has it. The form receives one entry per checked box under the group's name.
_Avoid_: Checkbox list, multi-checkbox, checkboxes (for the component)

**Parent checkbox**:
A checkbox over some of a Checkbox Group's boxes, its `Parent` part: checked while all of them are, mixed while some are. A click checks all, unchecks all, or brings back the combination checked when it was last mixed.
_Avoid_: Select all, master checkbox, tri-state checkbox (for the part)

**Radio**:
A group of radio buttons that holds one value, `menhir/radio` (#147): a `<fieldset role="radiogroup">` around Items, each a radio button with a `value`, checked while the group's value is its own. The form receives the checked value under the group's name.
_Avoid_: Radio group (as the component's name), RadioGroup, radio button (for the whole)

**Number Field**:
A text input for a number with buttons that step it, `menhir/number-field` (#149): the WAI-ARIA spinbutton, whose `Input` shows the number formatted for a locale and reads typed text back on blur and Enter, with `Increment` and `Decrement` buttons. The form receives the plain number from a hidden number input.
_Avoid_: Number input, spinner, stepper (for the component); spin button (for a part)

**Commit** (typed text):
Reading what the user typed into a Number Field's Input as its value, on blur or Enter; until then the text is kept as typed and the value as it was. Not each key.
_Avoid_: Parse (for the moment it happens), submit

**Touched**:
A Field the user has been through: focus has left it, its control has changed, or a submission of its form was attempted. A form reset clears it. Its error shows only once it is touched.
_Avoid_: Visited, blurred, dirty (a changed value, which Field does not track)

**Error from outside**:
An error message or invalid state the app hands a Field, such as a server's answer or a schema's issue, beside the browser's constraint validation.
_Avoid_: Server error (for every such error), external validation

### Styling

**Look**:
A complete visual style for Menhir's components, such as the shadcn look: tokens, recipes and a worked example per component, shipped in the styling skill. An app has one look; a look can have several themes.
_Avoid_: Theme, style, skin, preset

**Token**:
A named value of a look, such as `primary` or `radius`, that every component in the look uses instead of a raw colour or size.
_Avoid_: Variable (for the named value), design token (in full)

**Recipe**:
A look's rule for one kind of part, such as its buttons, focus ring or popup surface, written as the classes that make it.
_Avoid_: Variant, pattern

**Worked example**:
A component styled in a look, generated into the styling skill from the website's example, for an agent to start from.
_Avoid_: Template, snippet, recipe (recipes are the look's rules)
