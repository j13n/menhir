import {
  createColorMode,
  nextColorMode,
} from "menhir/color-mode/local-storage";

import ColorModeIcon from "../ColorModeIcon";

/**
 * One button that cycles through the modes. Its name says the current mode
 * and what a click does; the icon shows the current mode.
 */
export default function ColorModeToggle() {
  const colorMode = createColorMode();
  const next = () => nextColorMode(colorMode.mode(), colorMode.system());

  return (
    <button
      type="button"
      aria-label={`Color mode: ${colorMode.mode()}. Switch to ${next()}.`}
      title={`Color mode: ${colorMode.mode()}`}
      class="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-stone-700 hover:bg-stone-200/60 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
      onClick={() => colorMode.setMode(next())}
    >
      <ColorModeIcon mode={colorMode.mode()} />
    </button>
  );
}
