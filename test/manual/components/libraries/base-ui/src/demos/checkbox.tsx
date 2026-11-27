import { useState } from "react";

import { Checkbox } from "@base-ui/react/checkbox";

export default function CheckboxDemo() {
  // `indeterminate` is a controlled prop only: on until the first change.
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <div className="stack">
      <label className="row">
        <Checkbox.Root className="box">
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Accept terms
      </label>

      <label className="row">
        <Checkbox.Root
          className="box"
          indeterminate={indeterminate}
          onCheckedChange={() => setIndeterminate(false)}
        >
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Select all
      </label>

      <label className="row">
        <Checkbox.Root className="box" disabled>
          <Checkbox.Indicator className="check" />
        </Checkbox.Root>
        Subscribe
      </label>
    </div>
  );
}
