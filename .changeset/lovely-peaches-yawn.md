---
"menhir": patch
---

Add Avatar (`menhir/avatar`): a person's picture with a fallback such as initials while it loads and when it fails. The picture is a native `<img>` in the server HTML, its loading status is on every part as `data-*` and reported by `onLoadingStatusChange`, and a picture that loaded or failed before hydration is read once mounted.
