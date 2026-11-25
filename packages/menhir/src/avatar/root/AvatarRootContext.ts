import { createContext, useContext } from "solid-js";
import { isDev } from "@solidjs/web";

/**
 * Where the picture has got: `idle` without a `src` or an Image, then
 * `loading`, and `loaded` or `error`.
 */
export type AvatarLoadingStatus = "idle" | "loading" | "loaded" | "error";

/**
 * The status as `data-*` attributes, each `""` when it applies and absent
 * otherwise. Exactly one applies at a time.
 */
export type AvatarStatusAttributes = {
  readonly "data-idle": "" | undefined;
  readonly "data-loading": "" | undefined;
  readonly "data-loaded": "" | undefined;
  readonly "data-error": "" | undefined;
};

/** The `data-*` attributes of a status, as getters that follow it. */
export function createStatusAttributes(
  status: () => AvatarLoadingStatus,
): AvatarStatusAttributes {
  const is = (value: AvatarLoadingStatus) =>
    status() === value ? "" : undefined;
  return {
    get "data-idle"() {
      return is("idle");
    },
    get "data-loading"() {
      return is("loading");
    },
    get "data-loaded"() {
      return is("loaded");
    },
    get "data-error"() {
      return is("error");
    },
  };
}

export type AvatarRootContextValue = {
  /** The Image's status once it is mounted, else `idle`. */
  status: () => AvatarLoadingStatus;
  attributes: AvatarStatusAttributes;
  /** The Image hands over its status once mounted; returns what removes it. */
  registerImage: (status: () => AvatarLoadingStatus) => () => void;
};

// `null` outside a Root, so that the part can name what is missing. Solid's
// own error for a context with no provider and no default does not.
export const AvatarRootContext = createContext<AvatarRootContextValue | null>(
  null,
);

export function useAvatarRootContext(): AvatarRootContextValue {
  const context = useContext(AvatarRootContext);
  // Production builds drop the check, and its message, with `isDev`.
  if (isDev && !context) {
    throw new Error(
      "[menhir] Avatar parts must be placed within <Avatar.Root>.",
    );
  }
  return context!;
}
