---
"menhir": patch
---

Components no longer fail with "React is not defined" when rendered on the server under `@cloudflare/vite-plugin`, or any setup that pre-bundles the server's dependencies. No `optimizeDeps.exclude` is needed for `menhir`
