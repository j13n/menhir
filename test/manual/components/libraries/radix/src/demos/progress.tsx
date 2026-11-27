import { Progress } from "radix-ui";

// The progress bar has no label part; it is named by the visible label.
export default function ProgressDemo() {
  return (
    <>
      <div className="stack">
        <span id="uploading">Uploading</span>
        <Progress.Root
          className="track"
          value={40}
          max={100}
          aria-labelledby="uploading"
        >
          <Progress.Indicator className="fill" style={{ width: "40%" }} />
        </Progress.Root>
      </div>

      <h2>Indeterminate</h2>
      <div className="stack">
        <span id="loading">Loading</span>
        <Progress.Root className="track" value={null} aria-labelledby="loading">
          <Progress.Indicator className="fill" />
        </Progress.Root>
      </div>
    </>
  );
}
