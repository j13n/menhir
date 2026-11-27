import { ColorArea } from "@kobalte/core/color-area";
import { parseColor } from "@kobalte/core/colors";

export default function ColorAreaDemo() {
  return (
    <ColorArea class="stack" defaultValue={parseColor("rgb(2, 132, 199)")}>
      <ColorArea.Label>Colour</ColorArea.Label>
      <ColorArea.Background class="color-area">
        <ColorArea.Thumb class="color-thumb">
          <ColorArea.HiddenInputX />
          <ColorArea.HiddenInputY />
        </ColorArea.Thumb>
      </ColorArea.Background>
    </ColorArea>
  );
}
