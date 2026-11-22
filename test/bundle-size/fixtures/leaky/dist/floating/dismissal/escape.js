export function closeOnEscape(element) {
  element.addEventListener("keydown", () => element.remove());
}
