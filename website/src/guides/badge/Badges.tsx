const badge =
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export default function Badges() {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <span
        class={`${badge} border-transparent bg-primary text-primary-foreground`}
      >
        New
      </span>
      <span
        class={`${badge} border-transparent bg-secondary text-secondary-foreground`}
      >
        Draft
      </span>
      <span
        class={`${badge} border-transparent bg-destructive text-white dark:bg-destructive/60`}
      >
        Failed
      </span>
      <span class={`${badge} text-foreground`}>Beta</span>
    </div>
  );
}
