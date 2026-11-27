import { Slider } from "@base-ui/react/slider";

// For the range, the docs add an `aria-label` to each thumb ("Minimum
// price"). Left out here, to hear what the library says on its own.
export default function SliderDemo() {
  return (
    <>
      <Slider.Root min={0} max={100} defaultValue={30}>
        <Slider.Label>Volume</Slider.Label>
        <Slider.Control className="slider">
          <Slider.Track className="track">
            <Slider.Indicator className="fill" />
            <Slider.Thumb className="thumb" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <h2>Range</h2>
      <Slider.Root min={0} max={100} defaultValue={[20, 80]}>
        <Slider.Label>Price</Slider.Label>
        <Slider.Control className="slider">
          <Slider.Track className="track">
            <Slider.Indicator className="fill" />
            <Slider.Thumb index={0} className="thumb" />
            <Slider.Thumb index={1} className="thumb" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <h2>Vertical</h2>
      <Slider.Root min={0} max={100} defaultValue={30} orientation="vertical">
        <Slider.Label>Volume</Slider.Label>
        <Slider.Control className="slider">
          <Slider.Track className="track">
            <Slider.Indicator className="fill" />
            <Slider.Thumb className="thumb" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </>
  );
}
