import {
  getRequestEvent,
  isServer,
  parseCookieHeader,
  serializeCookie,
} from "@solidjs/web";

import { scriptLiteral } from "./preference.ts";
import type { PreferenceStorage } from "./preference.ts";

/** A year, in seconds: how long a saved choice lasts without a visit. */
const maxAge = 60 * 60 * 24 * 365;

/** The value of the cookie `key` in a `Cookie` header. */
export function cookieValue(
  cookieHeader: string | null | undefined,
  key: string,
): string | undefined {
  return parseCookieHeader(cookieHeader)[key];
}

/**
 * A cookie named by the key, which the browser sends with every request:
 * read on the server through `getRequestEvent()`, and in the browser from
 * `document.cookie`. Cookies have no `storage` event, so another tab's
 * choice is read when this tab is shown again.
 */
export const cookiePreference: PreferenceStorage = {
  read: (key) => {
    try {
      return cookieValue(
        isServer
          ? getRequestEvent()?.request.headers.get("cookie")
          : document.cookie,
        key,
      );
    } catch {
      // Cookies can be unavailable, as in a sandboxed frame; the choice
      // then lasts until the page is left.
      return undefined;
    }
  },
  write: (key, value) => {
    try {
      document.cookie = serializeCookie(key, value ?? "", {
        path: "/",
        maxAge: value === null ? 0 : maxAge,
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
      if (document.visibilityState !== "hidden") {
        onChange(cookiePreference.read(key));
      }
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
