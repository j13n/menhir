import { Progress } from "@base-ui/react/progress";

export default function ProgressDemo() {
  return (
    <>
      <Progress.Root value={40} className="stack">
        <Progress.Label>Uploading</Progress.Label>
        <Progress.Track className="track">
          <Progress.Indicator className="fill" />
        </Progress.Track>
        <Progress.Value />
      </Progress.Root>

      <h2>Indeterminate</h2>
      <Progress.Root value={null} className="stack">
        <Progress.Label>Loading</Progress.Label>
        <Progress.Track className="track">
          <Progress.Indicator className="fill" />
        </Progress.Track>
      </Progress.Root>
    </>
  );
}
