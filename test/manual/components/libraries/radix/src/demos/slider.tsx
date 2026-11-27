import { Slider } from "radix-ui";

// The slider has no label part; Radix's docs name each thumb with
// `aria-label`, next to the visible text.
export default function SliderDemo() {
  return (
    <>
      <div className="stack">
        <span>Volume</span>
        <Slider.Root className="slider" min={0} max={100} defaultValue={[30]}>
          <Slider.Track className="track">
            <Slider.Range className="fill" />
          </Slider.Track>
          <Slider.Thumb className="thumb" aria-label="Volume" />
        </Slider.Root>
      </div>

      <h2>Range</h2>
      <div className="stack">
        <span>Price</span>
        <Slider.Root
          className="slider"
          min={0}
          max={100}
          defaultValue={[20, 80]}
        >
          <Slider.Track className="track">
            <Slider.Range className="fill" />
          </Slider.Track>
          <Slider.Thumb className="thumb" aria-label="Price" />
          <Slider.Thumb className="thumb" aria-label="Price" />
        </Slider.Root>
      </div>

      <h2>Vertical</h2>
      <div className="stack">
        <span>Volume</span>
        <Slider.Root
          className="slider"
          orientation="vertical"
          min={0}
          max={100}
          defaultValue={[30]}
        >
          <Slider.Track className="track">
            <Slider.Range className="fill" />
          </Slider.Track>
          <Slider.Thumb className="thumb" aria-label="Volume" />
        </Slider.Root>
      </div>
    </>
  );
}
