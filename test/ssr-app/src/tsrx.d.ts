// tsc cannot read .tsrx files, so it has no types for App.tsx's import of
// TsrxSwitch.tsrx and fails without this. The Solid plugin compiles .tsrx for
// the builds; tsc leaves the files out of the program, so their own types go
// unchecked. Each .tsrx module here default-exports a component.
declare module "*.tsrx" {
  import type { Component } from "solid-js";

  const component: Component;
  export default component;
}
