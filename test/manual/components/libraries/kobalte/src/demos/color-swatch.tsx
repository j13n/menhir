import { ColorSwatch } from "@kobalte/core/color-swatch";
import { parseColor } from "@kobalte/core/colors";

export default function ColorSwatchDemo() {
  return (
    <div class="row">
      <span>Accent colour</span>
      <ColorSwatch
        class="color-swatch"
        value={parseColor("hsl(200, 98%, 39%)")}
      />
    </div>
  );
}
