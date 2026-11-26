---
"menhir": patch
---

A part no longer logs Solid's `STRICT_READ_UNTRACKED` warning in development when its props are spread from an expression, such as `<Select.Trigger {...omit(props, "class")} />`
