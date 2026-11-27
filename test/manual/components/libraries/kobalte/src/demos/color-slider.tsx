import { ColorSlider } from "@kobalte/core/color-slider";
import { parseColor } from "@kobalte/core/colors";

export default function ColorSliderDemo() {
  return (
    <ColorSlider
      class="stack"
      channel="hue"
      defaultValue={parseColor("hsl(0, 100%, 50%)")}
    >
      <div class="row">
        <ColorSlider.Label>Hue</ColorSlider.Label>
        <ColorSlider.ValueLabel />
      </div>
      <ColorSlider.Track class="color-track">
        <ColorSlider.Thumb class="color-thumb">
          <ColorSlider.Input />
        </ColorSlider.Thumb>
      </ColorSlider.Track>
    </ColorSlider>
  );
}
