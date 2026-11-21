import { Progress } from "menhir/progress";

export default function ProgressExample() {
  return (
    <Progress.Root
      value={60}
      aria-labelledby="progress-label"
      class="grid w-64 grid-cols-[1fr_auto] gap-2 text-sm"
    >
      <span id="progress-label">Uploading</span>
      <Progress.Value />
      <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <Progress.Indicator class="h-full w-(--progress) bg-stone-800 dark:bg-stone-300" />
      </div>
    </Progress.Root>
  );
}
