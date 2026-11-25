import { PreviewCard } from "menhir/preview-card";

// The link is inside a paragraph, which holds no <div>: the Popup, the
// Arrow and the card's content are <span>s, styled as blocks.
const span = (props: object) => <span {...props} />;

const popup =
  "w-64 origin-(--transform-origin) overflow-visible rounded-lg border border-stone-200 bg-white p-4 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-700 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0";
const arrow =
  "absolute size-2.5 rotate-45 border-stone-200 bg-white data-[side=bottom]:-top-1.5 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=left]:-right-1.5 data-[side=left]:border-t data-[side=left]:border-r data-[side=right]:-left-1.5 data-[side=right]:border-b data-[side=right]:border-l data-[side=top]:-bottom-1.5 data-[side=top]:border-r data-[side=top]:border-b dark:border-stone-700 dark:bg-stone-900";

export default function PreviewCardExample() {
  return (
    <p class="m-0 text-sm">
      Every control starts from a native element, as the{" "}
      <PreviewCard.Root>
        <PreviewCard.Trigger
          class="font-medium underline underline-offset-2"
          href="/docs/components/switch"
        >
          Switch
        </PreviewCard.Trigger>
        <PreviewCard.Popup class={popup} sideOffset={8} render={span}>
          <PreviewCard.Arrow class={arrow} render={span} />
          <strong class="block">Switch</strong>
          <span class="mt-1 block text-stone-500">
            A control that turns an option on or off, built on a native button.
          </span>
        </PreviewCard.Popup>
      </PreviewCard.Root>{" "}
      does.
    </p>
  );
}
