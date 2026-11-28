import {
  createColorScheme,
  nextColorScheme,
} from "menhir/color-scheme/local-storage";
import { Tooltip } from "menhir/tooltip";

import ColorSchemeIcon from "../ColorSchemeIcon";

const popup =
  "m-0 origin-(--transform-origin) overflow-visible rounded border-0 bg-stone-800 px-2 py-1 text-xs text-white transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-stone-200 dark:text-stone-950 starting:data-open:scale-95 starting:data-open:opacity-0";
const arrow =
  "absolute size-2 rotate-45 bg-stone-800 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1 dark:bg-stone-200";

/**
 * One button that cycles through the schemes. Its name says the current scheme
 * and what a click does, and a Tooltip shows the name; the icon shows the
 * current scheme.
 */
export default function ColorSchemeToggle() {
  const colorScheme = createColorScheme();
  const next = () =>
    nextColorScheme(colorScheme.scheme(), colorScheme.system());
  const label = () =>
    `Color scheme: ${colorScheme.scheme()}. Switch to ${next()}.`;

  return (
    <Tooltip.Root>
      {/* The tooltip says the name again, so it does not describe the button
          as well. */}
      <Tooltip.Trigger
        aria-label={label()}
        aria-describedby={false}
        class="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-stone-700 hover:bg-stone-200/60 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
        onClick={() => colorScheme.setScheme(next())}
      >
        <ColorSchemeIcon scheme={colorScheme.scheme()} />
      </Tooltip.Trigger>
      <Tooltip.Popup class={popup} side="bottom" sideOffset={8}>
        <Tooltip.Arrow class={arrow} />
        {label()}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}
