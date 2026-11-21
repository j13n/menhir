/**
 * Where a preference goes on `<html>`: a `data-*` attribute set to its
 * value, or `"class"` for a class named after it.
 */
export type PreferenceAttribute = "class" | `data-${string}`;

/**
 * Where a preference is saved, such as `localStorage` or a cookie. The
 * values are raw: the utility on top parses them.
 */
export interface PreferenceStorage {
  /** The saved value; none if nothing is saved or it cannot be read. */
  read: (key: string) => string | null | undefined;
  /** Saves a value; `null` removes the saved one. */
  write: (key: string, value: string | null) => void;
  /**
   * Calls `onChange` with the saved value when another tab may have changed
   * it. Returns the function that stops listening.
   */
  watch: (
    key: string,
    onChange: (value: string | null | undefined) => void,
  ) => () => void;
  /**
   * Whether `read` works on the server too, so that `createPreference` can
   * read the value during the first render without hydration disagreeing.
   */
  readsOnServer: boolean;
  /**
   * The head script's source for reading the value: statements that set
   * the variable `m` to the saved value. They run inside a `try`, and must
   * not be able to close the script element whatever `key` holds.
   */
  script: (key: string) => string;
}

/** A saved value, if it is one of `values`; otherwise `unset`. */
export function parsePreference<T extends string>(
  raw: string | null | undefined,
  values: readonly string[],
  unset: T,
): T {
  return raw && values.includes(raw) ? (raw as T) : unset;
}

/**
 * Puts a preference's value on `<html>`. With `"class"`, first removes the
 * classes of every value in `values`, so only one is on at a time.
 */
export function applyPreference(
  attribute: PreferenceAttribute,
  value: string,
  values: readonly string[],
) {
  const root = document.documentElement;
  if (attribute === "class") {
    root.classList.remove(...values);
    root.classList.add(value);
  } else {
    root.setAttribute(attribute, value);
  }
}

/** A string as a JavaScript literal that cannot close the script element. */
export function scriptLiteral(value: string): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
