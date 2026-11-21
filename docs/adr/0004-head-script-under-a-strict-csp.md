# A strict CSP is met by the app's script element, not by an option

A Content Security Policy without `'unsafe-inline'` blocks the inline head script of `menhir/color-mode` and `menhir/theme` unless it carries a nonce or the policy allows its hash (#64). Menhir adds no API for either. `colorModeScript()` and `themeScript()` return the script's source, and the app renders the `<script>` element, so a server that renders each page puts its nonce there (`<script nonce={nonce} innerHTML={colorModeScript()} />`), and a prerendered site allows the SHA-256 hash of the returned source, computed in its build. The docs pages show both, and tests in Chromium run the scripts under a policy with a nonce, with a hash, and with neither.

## Considered options

- **A `nonce` option**: the functions return source, not an element, so the option would have nothing to put the nonce on. Returning an element or an HTML string instead would break the one way the script is rendered today, for an attribute the app can already write.
- **A published hash for the default options**: it would cover only one entry point with no options, and change whenever the script's source does, so a site that pasted it would break its color mode on a Menhir upgrade. A hash computed from the source in the build covers every option and cannot go stale.
- **A `colorModeScriptHash()` function**: Web Crypto is asynchronous and `node:crypto` is not in a browser bundle, for two lines an app's build can write with `node:crypto`.
- **The script as a file**, allowed by `'self'`: a file loads after the page can paint, which brings back the flash the script exists to prevent, and it could not carry the options.

## Consequences

- The scripts' source is now something sites hash. It stays deterministic for the same entry point, options and Menhir version, and uses nothing else a policy restricts (no `eval`, inline style or request). A release may still change the source, so the docs say to compute the hash, not to paste it.
- The policy tests run only with `VITEST_ENV=chromium`, since jsdom enforces no policy.
