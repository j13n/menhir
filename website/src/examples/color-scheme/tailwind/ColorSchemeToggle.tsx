import {
  createColorScheme,
  nextColorScheme,
} from "menhir/color-scheme/local-storage";

import ColorSchemeIcon from "../ColorSchemeIcon";

/**
 * One button that cycles through the schemes. Its name says the current scheme
 * and what a click does; the icon shows the current scheme.
 */
export default function ColorSchemeToggle() {
  const colorScheme = createColorScheme();
  const next = () =>
    nextColorScheme(colorScheme.scheme(), colorScheme.system());

  return (
    <button
      type="button"
      aria-label={`Color scheme: ${colorScheme.scheme()}. Switch to ${next()}.`}
      title={`Color scheme: ${colorScheme.scheme()}`}
      class="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-stone-700 hover:bg-stone-200/60 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
      onClick={() => colorScheme.setScheme(next())}
    >
      <ColorSchemeIcon scheme={colorScheme.scheme()} />
    </button>
  );
}
