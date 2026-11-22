import { Dialog } from "@base-ui/react/dialog";
import { createRoot } from "react-dom/client";

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
      <h1>Base UI Dialog</h1>
      <p>Scroll down to the trigger, below row 12.</p>
      {rowsBefore.map((row) => (
        <div className="row" key={row}>
          {row}
        </div>
      ))}
      <Dialog.Root>
        <Dialog.Trigger>Dialog trigger</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="backdrop" />
          <Dialog.Popup className="popup">
            <Dialog.Title>Base UI Dialog</Dialog.Title>
            <p>Plain text to drag on.</p>
            <input placeholder="Focus me for the keyboard" />
            <div className="area">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {long && paragraphs.map((p) => <p key={p}>{p}</p>)}
            <Dialog.Close>Close Dialog</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {rowsAfter.map((row) => (
        <div className="row" key={row}>
          {row}
        </div>
      ))}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Page />);
startStatus("Base UI");
