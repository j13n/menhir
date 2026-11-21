// Stands in for a framework's build: in the tests it is left out of the
// bundle, and only its export names are read.
export const isDev = true;
export const isServer = true;
export function template(html) {
  return () => html;
}
