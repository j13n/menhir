import { Progress } from "menhir/progress";

import "./progress.css";

export default function ProgressExample() {
  return (
    <Progress.Root value={60} aria-labelledby="progress-label" class="progress">
      <span id="progress-label">Uploading</span>
      <Progress.Value />
      <div class="progress-track">
        <Progress.Indicator class="progress-indicator" />
      </div>
    </Progress.Root>
  );
}
