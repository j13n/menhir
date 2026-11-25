---
"menhir": patch
---

Add Toast (menhir/toast): short messages at an edge of the screen that stack and leave by themselves. The app makes the list with createToastManager() and adds to it from anywhere; the Region is a polite live region in the top layer that stays usable above an open modal dialog. Timers pause on hover, focus and while the page is hidden; swipe to dismiss (Toast.swipe) and a stack's heights (Toast.measure) are refs an app without them does not bundle.
