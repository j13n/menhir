import { RadioGroup } from "@kobalte/core/radio-group";

const plans = [
  { value: "free", label: "Free", disabled: false },
  { value: "pro", label: "Pro", disabled: false },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

export default function RadioDemo() {
  return (
    <RadioGroup class="stack" defaultValue="free">
      <RadioGroup.Label>Plan</RadioGroup.Label>
      {plans.map((plan) => (
        <RadioGroup.Item
          class="row"
          value={plan.value}
          disabled={plan.disabled}
        >
          <RadioGroup.ItemInput />
          <RadioGroup.ItemControl class="box round">
            <RadioGroup.ItemIndicator class="dot" />
          </RadioGroup.ItemControl>
          <RadioGroup.ItemLabel>{plan.label}</RadioGroup.ItemLabel>
        </RadioGroup.Item>
      ))}
    </RadioGroup>
  );
}
