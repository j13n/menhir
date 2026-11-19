// Throwaway Switch from the spikes (#5, #6): just enough for the ported key
// test and for the build to have a component with JSX. The real one is #15.
import { createSignal } from "solid-js";

export function SwitchRoot() {
  const [checked, setChecked] = createSignal(false);
  const toggle = () => setChecked((value) => !value);

  // Like Base UI's default <span role="switch">: Enter acts on key down,
  // Space on key up.
  return (
    <span
      role="switch"
      tabindex={0}
      // Solid 2.0 removes an attribute set to false, so spell the value out.
      aria-checked={checked() ? "true" : "false"}
      onKeyDown={(event) => {
        if (event.key === "Enter") toggle();
      }}
      onKeyUp={(event) => {
        if (event.key === " ") toggle();
      }}
    />
  );
}
