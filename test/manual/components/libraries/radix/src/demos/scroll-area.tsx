import { ScrollArea } from "radix-ui";

import { lines } from "../../../../shared/content.ts";

export default function ScrollAreaDemo() {
  return (
    <ScrollArea.Root className="scroll">
      <ScrollArea.Viewport className="scroll-viewport">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
        <ScrollArea.Thumb className="scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
