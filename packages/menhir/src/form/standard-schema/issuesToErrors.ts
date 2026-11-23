import type { FormErrors } from "../../core/formContext.ts";

// The shape of a Standard Schema V1 `Issue` (https://standardschema.dev),
// declared here, so that Menhir depends on no schema library.

/** A segment of an issue's path, in its object form. */
export interface PathSegment {
  readonly key: PropertyKey;
}

/** A problem a schema found: its message, and where in the value. */
export interface Issue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
}

/**
 * Turns a schema's issues into Form's `errors`: each issue's message under
 * its path, the keys joined with dots (`content.year`, `sources.0`). The
 * first issue on a path wins. An issue with no path, an error of the whole
 * form, goes under `""`.
 */
export function issuesToErrors(issues: ReadonlyArray<Issue>): FormErrors {
  // No prototype, so a key such as `__proto__` is an own key, and
  // `constructor` is not read from `Object.prototype`.
  const errors: Record<string, string> = Object.create(null);
  for (const issue of issues) {
    const key = (issue.path ?? [])
      .map((segment) =>
        String(typeof segment === "object" ? segment.key : segment),
      )
      .join(".");
    errors[key] ??= issue.message;
  }
  return errors;
}
