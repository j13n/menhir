---
"menhir": patch
---

Add Radio (`menhir/radio`): radio buttons that hold one value, with `value`, `defaultValue` and `onValueChange` (`null` while none is checked), submitted under the group's `name` as a native radio group. A `<fieldset role="radiogroup">` named by its `<legend>`, one tab stop on the checked radio, arrow keys that move focus and check, `required` and `disabled` for the group, `disabled` for one radio, and an `Indicator` for the dot. It joins a Field as `Field.Control`'s `render`. Switch and Checkbox now share their hidden input with it, about 30 B more each on their own and less in an app that uses Radio too.
