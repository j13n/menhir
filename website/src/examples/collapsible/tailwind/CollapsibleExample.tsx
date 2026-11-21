import { Collapsible } from "menhir/collapsible";

export default function CollapsibleExample() {
  return (
    <Collapsible.Root class="w-64 text-sm">
      <Collapsible.Trigger class="flex cursor-pointer items-center gap-2 font-semibold before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
        Shipping
      </Collapsible.Trigger>
      <Collapsible.Panel class="mt-2 text-stone-600 dark:text-stone-400">
        Orders ship within two working days, and arrive three to five days
        later.
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
