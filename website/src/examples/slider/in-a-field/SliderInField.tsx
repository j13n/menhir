import { Field } from "menhir/field";
import { Slider } from "menhir/slider";

export default function SliderInField() {
  return (
    <Field.Root name="volume">
      <Field.Label>Volume</Field.Label>
      <Field.Control render={(p) => <Slider.Root {...p} defaultValue={40} />}>
        <Slider.Track class="slider-track">
          <div class="slider-indicator" />
          <Slider.Thumb class="slider-thumb" />
        </Slider.Track>
      </Field.Control>
      <Field.Description>Of the speakers in the room.</Field.Description>
      <Field.Error />
    </Field.Root>
  );
}
