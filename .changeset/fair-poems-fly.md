---
"menhir": patch
---

Adds Menu (`menhir/menu`): a list of actions that a button opens, with Root, Trigger, Popup, Item, CheckboxItem, RadioGroup, RadioItem, ItemIndicator, Group, GroupLabel, Submenu and SubmenuTrigger parts. The arrow keys, Home, End and typing move through the items; Enter, Space or a click activates one and closes every menu, except that Space changes a checkbox or radio item and leaves the menu open; submenus open by Right Arrow, Enter, Space or the pointer resting on their trigger, and stay open while the pointer crosses to them. `onOpenChange` reports two new reasons, `"item-press"` and `"arrow-key"`.
