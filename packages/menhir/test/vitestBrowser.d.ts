// The part of `vitest/browser` that the tests use, for type checking only
// (tsconfig.json, `paths`). The module exists only in Vitest's browser mode.
export const userEvent: {
  keyboard(text: string): Promise<void>;
};

/** A Chrome DevTools Protocol session on the test page. */
export function cdp(): {
  send(method: string, params?: Record<string, unknown>): Promise<unknown>;
};
