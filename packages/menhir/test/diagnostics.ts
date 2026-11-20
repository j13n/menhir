import { captureArtifact } from "@solidjs/diagnostics";
import type { DiagnosticsArtifact } from "@solidjs/diagnostics";

/**
 * Starts recording Solid's dev diagnostics, such as a reactive read at the
 * top of a component body, until `stop` is called. `captureArtifact` takes
 * the scenario as a function; here the scenario is a promise that `stop`
 * resolves, so the recording can span a whole test, hooks included.
 */
export function captureDiagnostics(): { stop(): Promise<DiagnosticsArtifact> } {
  let finish!: () => void;
  const done = new Promise<void>((resolve) => (finish = resolve));
  // Diagnostics only: attribution records every computation's re-runs,
  // which no check here reads.
  const capture = captureArtifact(() => done, { attribution: false });
  return {
    async stop() {
      finish();
      return (await capture).artifact;
    },
  };
}
