import { useId } from "react";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

export default function RadioDemo() {
  // The group has no label part; the docs name it with `aria-labelledby`.
  const id = useId();

  return (
    <RadioGroup aria-labelledby={id} defaultValue="free" className="stack">
      <div id={id}>Plan</div>

      <label className="row">
        <Radio.Root value="free" className="box round">
          <Radio.Indicator className="dot" />
        </Radio.Root>
        Free
      </label>

      <label className="row">
        <Radio.Root value="pro" className="box round">
          <Radio.Indicator className="dot" />
        </Radio.Root>
        Pro
      </label>

      <label className="row">
        <Radio.Root value="enterprise" className="box round" disabled>
          <Radio.Indicator className="dot" />
        </Radio.Root>
        Enterprise
      </label>
    </RadioGroup>
  );
}
