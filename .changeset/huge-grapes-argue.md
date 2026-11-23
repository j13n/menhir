---
"menhir": patch
---

Adds Context Menu (`menhir/context-menu`): Menu's menu, opened from an area by the `contextmenu` event, with Root, Trigger and Popup parts of its own and Menu's items, groups and submenus. A right-click, a Ctrl+click on macOS or a long press on Android opens it at the pointer; Shift+F10 or the Menu key opens it below the focused element; a right-click while it is open moves it. `disabled` on the Trigger lets the browser's own menu show. An app that uses Menu too pays for the shared parts once.
