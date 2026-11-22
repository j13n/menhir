import Dialog from "corvu/dialog";
import { For, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  lines,
  long,
  paragraphs,
  rowsAfter,
  rowsBefore,
  startStatus,
} from "../../shared/status.ts";
import "../../shared/page.css";

function Page() {
  return (
    <>
      <h1>corvu Dialog</h1>
      <p>Scroll down to the trigger, below row 12.</p>
      <For each={rowsBefore}>{(row) => <div class="row">{row}</div>}</For>
      <Dialog>
        <Dialog.Trigger>Dialog trigger</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay class="backdrop" />
          <Dialog.Content class="popup">
            <Dialog.Label>corvu Dialog</Dialog.Label>
            <p>Plain text to drag on.</p>
            <input placeholder="Focus me for the keyboard" />
            <div class="area">
              <For each={lines}>{(line) => <p>{line}</p>}</For>
            </div>
            <Show when={long}>
              <For each={paragraphs}>{(p) => <p>{p}</p>}</For>
            </Show>
            <Dialog.Close>Close Dialog</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <For each={rowsAfter}>{(row) => <div class="row">{row}</div>}</For>
    </>
  );
}

render(() => <Page />, document.getElementById("root")!);
startStatus("corvu");
