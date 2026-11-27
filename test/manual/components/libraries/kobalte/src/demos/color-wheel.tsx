import { ColorWheel } from "@kobalte/core/color-wheel";
import { parseColor } from "@kobalte/core/colors";

export default function ColorWheelDemo() {
  return (
    <ColorWheel class="stack" defaultValue={parseColor("hsl(200, 100%, 50%)")}>
      <div class="row">
        <ColorWheel.Label>Hue</ColorWheel.Label>
        <ColorWheel.ValueLabel />
      </div>
      <ColorWheel.Track class="color-wheel">
        <ColorWheel.Thumb class="color-thumb">
          <ColorWheel.Input />
        </ColorWheel.Thumb>
      </ColorWheel.Track>
    </ColorWheel>
  );
}
