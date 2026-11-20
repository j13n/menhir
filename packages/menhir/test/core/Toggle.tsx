// A test part for createControllableSignal, shared by its client test and
// the hydration fixture.
import { createControllableSignal } from "../../src/core/createControllableSignal.ts";

// A toggle button with `pressed`, `defaultPressed` and `onPressedChange`,
// the shape of a stateful part's props.
export function Toggle(props: {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}) {
  const [pressed, setPressed] = createControllableSignal({
    get value() {
      return props.pressed;
    },
    get defaultValue() {
      return props.defaultPressed ?? false;
    },
    onChange: (value) => props.onPressedChange?.(value),
  });
  return (
    <>
      <button
        aria-label="Toggle"
        aria-pressed={pressed() ? "true" : "false"}
        onClick={() => setPressed(!pressed())}
      />
      <button aria-label="Press" onClick={() => setPressed(true)} />
      <button
        aria-label="Press and release"
        onClick={() => {
          setPressed(true);
          setPressed(false);
        }}
      />
    </>
  );
}
