// What the render server's global setup provides to the `hydrate` project's
// tests. Its own file because both sides are typechecked, by different
// tsconfigs.
declare module "vitest" {
  interface ProvidedContext {
    renderServerUrl: string;
  }
}

export {};
