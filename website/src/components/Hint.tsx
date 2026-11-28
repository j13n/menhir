import type { JSX } from "@solidjs/web";
import { Tooltip } from "menhir/tooltip";

const popup =
  "m-0 origin-(--transform-origin) overflow-visible rounded border-0 bg-stone-800 px-2 py-1 text-xs text-white transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-stone-200 dark:text-stone-950 starting:data-open:scale-95 starting:data-open:opacity-0";
const arrow =
  "absolute size-2 rotate-45 bg-stone-800 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1 dark:bg-stone-200";

/**
 * The site's tooltip: a `Tooltip.Popup` with its arrow, in the look of the
 * Tooltip page's Tailwind example. Place it in a `Tooltip.Root`, after the
 * `Tooltip.Trigger`.
 */
export default function Hint(props: {
  /** Where it opens; the Popup's default is above the Trigger. */
  side?: "top" | "bottom" | "left" | "right";
  children: JSX.Element;
}) {
  return (
    <Tooltip.Popup class={popup} side={props.side} sideOffset={8}>
      <Tooltip.Arrow class={arrow} />
      {props.children}
    </Tooltip.Popup>
  );
}
