import { Slider } from "@kobalte/core/slider";

export default function SliderDemo() {
  return (
    <>
      <Slider class="stack" defaultValue={[30]}>
        <div class="row">
          <Slider.Label>Volume</Slider.Label>
          <Slider.ValueLabel />
        </div>
        <div class="slider">
          <Slider.Track class="track">
            <Slider.Fill class="fill" />
            <Slider.Thumb class="thumb">
              <Slider.Input />
            </Slider.Thumb>
          </Slider.Track>
        </div>
      </Slider>

      <h2>Range</h2>
      <Slider class="stack" defaultValue={[20, 80]}>
        <div class="row">
          <Slider.Label>Price</Slider.Label>
          <Slider.ValueLabel />
        </div>
        <div class="slider">
          <Slider.Track class="track">
            <Slider.Fill class="fill" />
            <Slider.Thumb class="thumb">
              <Slider.Input />
            </Slider.Thumb>
            <Slider.Thumb class="thumb">
              <Slider.Input />
            </Slider.Thumb>
          </Slider.Track>
        </div>
      </Slider>

      <h2>Vertical</h2>
      <Slider class="stack" defaultValue={[30]} orientation="vertical">
        <div class="row">
          <Slider.Label>Volume</Slider.Label>
          <Slider.ValueLabel />
        </div>
        <div class="slider vertical">
          <Slider.Track class="track">
            <Slider.Fill class="fill" />
            <Slider.Thumb class="thumb">
              <Slider.Input />
            </Slider.Thumb>
          </Slider.Track>
        </div>
      </Slider>
    </>
  );
}
