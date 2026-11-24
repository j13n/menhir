import { renderStepButton } from "../stepButton.tsx";
import type { StepButtonProps } from "../stepButton.tsx";

export type NumberFieldDecrementProps = StepButtonProps;

/**
 * The button that decreases the number by `step`: a `<button type="button"
 * tabindex="-1">`, repeating while held, disabled at `min`. Give it a
 * name, such as `aria-label="Decrease"`. Place it inside `NumberField.Root`.
 */
export function NumberFieldDecrement(props: NumberFieldDecrementProps) {
  return renderStepButton(props, -1, "NumberField.Decrement");
}
