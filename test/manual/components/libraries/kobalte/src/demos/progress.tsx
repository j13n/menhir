import { Progress } from "@kobalte/core/progress";

export default function ProgressDemo() {
  return (
    <>
      <Progress class="stack" value={40}>
        <div class="row">
          <Progress.Label>Uploading</Progress.Label>
          <Progress.ValueLabel />
        </div>
        <Progress.Track class="track">
          <Progress.Fill class="fill" />
        </Progress.Track>
      </Progress>

      <h2>Indeterminate</h2>
      <Progress class="stack" indeterminate>
        <Progress.Label>Loading</Progress.Label>
        <Progress.Track class="track">
          <Progress.Fill class="fill" />
        </Progress.Track>
      </Progress>
    </>
  );
}
