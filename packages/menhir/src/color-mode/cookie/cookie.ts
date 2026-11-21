import {
  getRequestEvent,
  isServer,
  parseCookieHeader,
  serializeCookie,
} from "@solidjs/web";

import {
  defaultStorageKey,
  parseColorMode,
  scriptLiteral,
} from "../colorMode.ts";
import type {
  ColorMode,
  ColorModeOptions,
  ColorModeStorage,
} from "../colorMode.ts";
import { colorModeScriptWithStorage } from "../colorModeScript.ts";
import { createColorModeWithStorage } from "../createColorMode.ts";
import type { ColorModeState } from "../createColorMode.ts";

/** A year, in seconds: how long a saved choice lasts without a visit. */
const maxAge = 60 * 60 * 24 * 365;

/**
 * A cookie named by `storageKey`, which the browser sends with every
 * request: read on the server through `getRequestEvent()`, and here from
 * `document.cookie`. Cookies have no `storage` event, so another tab's
 * choice is read when this tab is shown again.
 */
const storage: ColorModeStorage = {
  read: (key) => {
    try {
      const header = isServer
        ? getRequestEvent()?.request.headers.get("cookie")
        : document.cookie;
      return colorModeFromCookie(header, { storageKey: key });
    } catch {
      // Cookies can be unavailable, as in a sandboxed frame; the choice
      // then lasts until the page is left.
      return "system";
    }
  },
  write: (key, mode) => {
    try {
      document.cookie = serializeCookie(key, mode === "system" ? "" : mode, {
        path: "/",
        maxAge: mode === "system" ? 0 : maxAge,
        sameSite: "lax",
        // A browser refuses a cookie with either prefix unless it is Secure.
        secure: /^__(Host|Secure)-/.test(key),
      });
    } catch {
      // See read.
    }
  },
  watch: (key, onChange) => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") onChange(storage.read(key));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  },
  readsOnServer: true,
  // The name is saved encoded (`serializeCookie`), so the script looks for
  // the encoded form. The last cookie of the name wins, as in
  // `parseCookieHeader`.
  script: (key) =>
    `var c=document.cookie.split(";"),n=${scriptLiteral(`${encodeURIComponent(key)}=`)};` +
    "for(var i=0;i<c.length;i++){var p=c[i].trim();if(p.indexOf(n)===0)m=p.slice(n.length)}",
};

/**
 * The reader's light, dark or system choice, saved in a cookie and applied
 * to `<html>` (`ColorModeOptions.attribute`). Follows the system preference
 * while the choice is `system`, and stays in step with the other instances
 * in this tab, and with other tabs once they are shown again.
 *
 * Call it in a component. The cookie is read during the first render, on
 * the server from the request (`getRequestEvent()`), so the server's HTML
 * shows the choice and hydration agrees. Only `system` waits until the page
 * has settled, since the server cannot see the system's preference. The
 * page has to be rendered for each request: a prerendered page has no
 * cookie to read. The head script from `colorModeScript`, with the same
 * options, applies a `system` choice before the first paint.
 */
export function createColorMode(options?: ColorModeOptions): ColorModeState {
  return createColorModeWithStorage(storage, options);
}

/**
 * The source of a script for the document head that applies the choice
 * saved in the cookie, or the system preference, before the page first
 * paints. Pass the options given to `createColorMode`. Render it inline,
 * before any styles that depend on the mode, even when the server renders
 * the choice: it is what applies `system`.
 *
 * ```tsx
 * <script innerHTML={colorModeScript()} />
 * ```
 */
export function colorModeScript(options?: ColorModeOptions): string {
  return colorModeScriptWithStorage(storage, options);
}

/**
 * The mode saved in a `Cookie` request header, for a server that puts the
 * attribute on its own `<html>`. Pass the options given to
 * `createColorMode`.
 */
export function colorModeFromCookie(
  cookieHeader: string | null | undefined,
  options: Pick<ColorModeOptions, "storageKey"> = {},
): ColorMode {
  const cookies = parseCookieHeader(cookieHeader);
  return parseColorMode(cookies[options.storageKey ?? defaultStorageKey]);
}
