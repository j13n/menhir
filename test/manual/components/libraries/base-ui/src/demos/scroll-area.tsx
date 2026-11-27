import { ScrollArea } from "@base-ui/react/scroll-area";

import { lines } from "../../../../shared/content.ts";

export default function ScrollAreaDemo() {
  return (
    <ScrollArea.Root className="scroll">
      <ScrollArea.Viewport className="scroll-viewport">
        <ScrollArea.Content className="scroll-content">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="scrollbar">
        <ScrollArea.Thumb className="scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
