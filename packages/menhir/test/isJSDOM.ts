/**
 * Whether the tests run in jsdom rather than a real browser. jsdom cannot
 * model focus, layout or pointer behaviour faithfully, and enforces no
 * Content Security Policy, so cases that depend on them are marked
 * `it.skipIf(isJSDOM)` and run only with
 * `VITEST_ENV=chromium` (PLAN.md section 7).
 */
export const isJSDOM = /jsdom/.test(window.navigator.userAgent);
