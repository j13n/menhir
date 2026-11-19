// Throwaway Switch for the test-renderer spike (#5): just enough for the
// ported key test. The real one is #15.
import { createSignal } from "solid-js";

function Root() {
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

export const Switch = { Root };
