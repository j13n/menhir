// A simple component that breaks layer rule 4 of PLAN.md section 6: it
// imports the `floating` layer. floating.test.ts checks that the leak check
// reports it.
import { position } from "../floating/position.js";

export function Root(element) {
  position(element);
}
