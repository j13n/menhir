import { scriptLiteral } from "./preference.ts";
import type { PreferenceStorage } from "./preference.ts";

/** `localStorage`, which only the browser can read. */
export const localStoragePreference: PreferenceStorage = {
  read: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      // Storage can be unavailable, such as with cookies blocked; the
      // choice then lasts until the page is left.
      return null;
    }
  },
  write: (key, value) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // See read.
    }
  },
  watch: (key, onChange) => {
    const onStorage = (event: StorageEvent) => {
      // A `null` key means the whole storage was cleared.
      if (event.key === key || event.key === null) onChange(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
  readsOnServer: false,
  script: (key) => `m=localStorage.getItem(${scriptLiteral(key)})`,
};
