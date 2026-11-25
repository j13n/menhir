import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { Switch } from "menhir/switch";

// A `render` component: it gets the Switch's element props and spreads them.
function StyledButton(props: JSX.IntrinsicElements["button"]) @{
  <button data-styled="" {...props} />
}

export default function TsrxSwitch() @{
  const [checked, setChecked] = createSignal(false);
  <>
    <Switch.Root checked={checked()} onCheckedChange={setChecked}>
      <Switch.Thumb />
    </Switch.Root>
    @if (checked()) {
      <p>{"on"}</p>
    }
    <Switch.Root render={StyledButton} />
  </>
}
