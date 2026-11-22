import { Tooltip } from "menhir/tooltip";

const trigger =
  "size-8 cursor-pointer rounded-md border border-stone-300 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-600";
const popup =
  "m-0 origin-(--transform-origin) overflow-visible rounded border-0 bg-stone-800 px-2 py-1 text-xs text-white transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-stone-200 dark:text-stone-950 starting:data-open:scale-95 starting:data-open:opacity-0";
const arrow =
  "absolute size-2 rotate-45 bg-stone-800 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1 dark:bg-stone-200";

export default function TooltipExample() {
  return (
    <Tooltip.Group>
      <div class="flex gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger class={trigger} aria-label="Bold">
            <b>B</b>
          </Tooltip.Trigger>
          <Tooltip.Popup class={popup} sideOffset={8}>
            <Tooltip.Arrow class={arrow} />
            Make text bold (Ctrl+B)
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger class={trigger} aria-label="Italic">
            <i>I</i>
          </Tooltip.Trigger>
          <Tooltip.Popup class={popup} sideOffset={8}>
            <Tooltip.Arrow class={arrow} />
            Make text italic (Ctrl+I)
          </Tooltip.Popup>
        </Tooltip.Root>
      </div>
    </Tooltip.Group>
  );
}
