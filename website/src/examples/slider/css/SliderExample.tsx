import { Slider } from "menhir/slider";

import "./slider.css";

export default function SliderExample() {
  return (
    <Slider.Root
      id="year"
      name="year"
      defaultValue={1969}
      min={1900}
      max={2025}
      format={{ useGrouping: false }}
      class="slider"
    >
      <label for="year">Year</label>
      <Slider.Value />
      <Slider.Track class="slider-track">
        <div class="slider-indicator" />
        <Slider.Thumb class="slider-thumb" />
      </Slider.Track>
    </Slider.Root>
  );
}
