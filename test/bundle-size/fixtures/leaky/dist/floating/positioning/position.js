import { computePosition } from "@floating-ui/dom";

export function position(element) {
  computePosition(element, element.parentElement);
}
