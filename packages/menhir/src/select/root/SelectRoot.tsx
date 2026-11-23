import type { JSX } from "@solidjs/web";

import { createSelect, SelectContext } from "./SelectContext.ts";
import type { SelectStateProps } from "./SelectContext.ts";

export interface SelectRootProps extends SelectStateProps {
  children?: JSX.Element;
}

/**
 * A value selected from a list that a button opens: holds the value and
 * whether the list is open, and shares them with `Select.Trigger`,
 * `Select.Value`, `Select.Popup` and the items inside it. Its form props
 * go on the hidden input the Trigger renders. Renders no element of its
 * own.
 */
export function SelectRoot(props: SelectRootProps) {
  return (
    <SelectContext value={createSelect(props)}>{props.children}</SelectContext>
  );
}
