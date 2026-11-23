import { createContext } from "solid-js";

/**
 * Errors keyed by a Field's `name`, each one message, such as a server's
 * answer to a submission or a schema's issues. A nested or repeated value's
 * key is its path joined with dots: `content.year`, `sources.0`.
 */
export type FormErrors = Readonly<Partial<Record<string, string>>>;

/** What Form shares with the Fields inside it. */
export interface FormContextValue {
  /** The error Form shows in the Field with this `name`, if any. */
  error(name: string): string | undefined;
}

// `null` outside a Form, where a Field reads no errors. In `core`, so that
// Form imports no module of Field and Field none of Form (PLAN.md section
// 6, rule 4).
export const FormContext = createContext<FormContextValue | null>(null);
