import { For } from "solid-js";
import { ScrollArea } from "menhir/scroll-area";

import "./scroll-area.css";

const releases = Array.from(
  { length: 24 },
  (_, index) => `Release 2.${24 - index}`,
);

export default function ScrollAreaExample() {
  return (
    <ScrollArea.Root class="scroll-area">
      <ScrollArea.Viewport class="scroll-area-viewport" aria-label="Releases">
        <ScrollArea.Content class="scroll-area-content">
          <For each={releases}>{(release) => <p>{release}</p>}</For>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar class="scroll-area-scrollbar">
        <ScrollArea.Thumb class="scroll-area-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
