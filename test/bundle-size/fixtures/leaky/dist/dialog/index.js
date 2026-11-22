// A popup that breaks its row in popupModules.ts: Dialog may use dismissal
// but not positioning. popupModules.test.ts checks that the check reports it.
import { closeOnEscape } from "../floating/dismissal/escape.js";
import { position } from "../floating/positioning/position.js";

export function Root(element) {
  closeOnEscape(element);
  position(element);
}
