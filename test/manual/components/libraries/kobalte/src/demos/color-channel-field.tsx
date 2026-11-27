import { ColorChannelField } from "@kobalte/core/color-channel-field";
import { parseColor } from "@kobalte/core/colors";

export default function ColorChannelFieldDemo() {
  return (
    <ColorChannelField
      class="stack"
      defaultValue={parseColor("hsl(200, 98%, 39%)")}
      channel="hue"
    >
      <ColorChannelField.Label>Hue</ColorChannelField.Label>
      <div class="row">
        <ColorChannelField.DecrementTrigger>
          −
        </ColorChannelField.DecrementTrigger>
        <ColorChannelField.Input />
        <ColorChannelField.IncrementTrigger>
          +
        </ColorChannelField.IncrementTrigger>
      </div>
    </ColorChannelField>
  );
}
