---
"menhir": patch
---

Adds Navigation Menu (`menhir/navigation-menu`): a site's navigation, with Root (a `<nav>`), Item, Trigger, Panel and Link parts. A Panel opens on a press and when the pointer rests on its Trigger, moving along the bar opens the next at once, and Escape, focus leaving the `<nav>`, a press outside and a Link close it. Panels are in the page's flow, `hidden` while closed, so their links are in the server HTML. `onValueChange` reports two new reasons, `"focus-out"` and `"link-press"`.
