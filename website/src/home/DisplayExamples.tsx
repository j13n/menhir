import { Meter } from "menhir/meter";
import { Progress } from "menhir/progress";
import { Separator } from "menhir/separator";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

export default function DisplayExamples() {
  return (
    <ExampleGroup category="Display">
      <ExampleCard name="Progress" href="/docs/components/progress">
        <Progress.Root
          value={70}
          aria-labelledby="home-progress-label"
          class="grid grid-cols-[1fr_auto] gap-2"
        >
          <span id="home-progress-label">Uploading</span>
          <Progress.Value class="text-sm text-stone-500" />
          <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <Progress.Indicator class="h-full w-(--progress) bg-stone-800 dark:bg-stone-300" />
          </div>
        </Progress.Root>
      </ExampleCard>
      <ExampleCard name="Meter" href="/docs/components/meter">
        <Meter.Root
          value={80}
          aria-labelledby="home-meter-label"
          class="grid grid-cols-[1fr_auto] gap-2"
        >
          <span id="home-meter-label">Battery</span>
          <Meter.Value class="text-sm text-stone-500" />
          <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div class="h-full w-(--meter) bg-stone-800 dark:bg-stone-300" />
          </div>
        </Meter.Root>
      </ExampleCard>
      <ExampleCard name="Separator" href="/docs/components/separator">
        <div class="flex items-center gap-3">
          Draft
          <Separator.Root
            orientation="vertical"
            class="h-4 w-px bg-stone-300 dark:bg-stone-700"
          />
          Review
          <Separator.Root
            orientation="vertical"
            class="h-4 w-px bg-stone-300 dark:bg-stone-700"
          />
          Publish
        </div>
      </ExampleCard>
    </ExampleGroup>
  );
}
