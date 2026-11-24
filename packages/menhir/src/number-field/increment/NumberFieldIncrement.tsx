import { renderStepButton } from "../stepButton.tsx";
import type { StepButtonProps } from "../stepButton.tsx";

export type NumberFieldIncrementProps = StepButtonProps;

/**
 * The button that increases the number by `step`: a `<button type="button"
 * tabindex="-1">`, repeating while held, disabled at `max`. Give it a
 * name, such as `aria-label="Increase"`. Place it inside `NumberField.Root`.
 */
export function NumberFieldIncrement(props: NumberFieldIncrementProps) {
  return renderStepButton(props, 1, "NumberField.Increment");
}
