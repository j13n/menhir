// Rendered on the server and hydrated in the test, so both sides get the
// same tree.
import { For, createSignal } from "solid-js";

import { ScrollArea } from "../../src/scroll-area/index.ts";

export default function ScrollAreaFixture() {
  const [notes, setNotes] = createSignal(4);
  return (
    <>
      <button type="button" onClick={() => setNotes((count) => count + 4)}>
        More notes
      </button>
      <ScrollArea.Root
        id="root"
        style={{ position: "relative", width: "200px", height: "100px" }}
      >
        <ScrollArea.Viewport
          id="viewport"
          aria-label="Release notes"
          style={{ overflow: "auto", height: "100px" }}
        >
          <ScrollArea.Content id="content">
            <For each={Array.from({ length: notes() }, (_, index) => index)}>
              {(index) => (
                <p style={{ height: "50px", margin: 0 }}>Note {index + 1}</p>
              )}
            </For>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          id="scrollbar"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "10px",
          }}
        >
          <ScrollArea.Thumb style={{ height: "var(--thumb-size)" }} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </>
  );
}
