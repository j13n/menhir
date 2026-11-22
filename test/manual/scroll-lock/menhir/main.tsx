import { render } from "@solidjs/web";
import { For, Show } from "solid-js";

// The repo's test Dialog: a <dialog> with showModal(), createDialogClose and
// createScrollLock, as Dialog (#31) will wire them.
import { Dialog } from "../../../../packages/menhir/test/floating/scroll-lock/Dialog.tsx";
import {
  lines,
  long,
  paragraphs,
  rowsAfter,
  rowsBefore,
  startStatus,
} from "../shared/status.ts";
import "../shared/page.css";

// Links on the bar go to the library pages on the other server.
const libraries = `http://${location.hostname}:5181`;

function Page() {
  return (
    <>
      <h1>Menhir Dialog</h1>
      <p>Scroll down to the trigger, below row 12.</p>
      <For each={rowsBefore}>{(row) => <div class="row">{row}</div>}</For>
      <Dialog label="Dialog">
        <p>Plain text to drag on.</p>
        <input placeholder="Focus me for the keyboard" />
        <div class="area">
          <For each={lines}>{(line) => <p>{line}</p>}</For>
        </div>
        <Show when={long}>
          <For each={paragraphs}>{(p) => <p>{p}</p>}</For>
        </Show>
      </Dialog>
      <For each={rowsAfter}>{(row) => <div class="row">{row}</div>}</For>
    </>
  );
}

render(() => <Page />, document.getElementById("root")!);
startStatus("Menhir", libraries);
