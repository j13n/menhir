import { createEffect, createMemo, createSignal, onSettled } from "solid-js";

import { stoneFrame, TURN_FRAMES } from "./stoneFrames";

/** Time between frames: a full turn takes TURN_FRAMES × FRAME_MS. */
export const FRAME_MS = 100;

/** Every turn shows the same frames, so each is drawn once. */
const frames = new Map<number, string>();
function frameAt(step: number) {
  const index = step % TURN_FRAMES;
  let frame = frames.get(index);
  if (frame === undefined) {
    frame = stoneFrame(index);
    frames.set(index, frame);
  }
  return frame;
}

/**
 * The front page's ASCII menhir, a standing stone turning slowly on its
 * upright axis. It turns once mounted unless the reader prefers reduced
 * motion. It has no pause control, which WCAG 2.2.2 asks of moving content
 * that lasts more than five seconds.
 */
export default function MenhirScene() {
  const [step, setStep] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);
  const frame = createMemo(() => frameAt(step()));

  onSettled(() => {
    if (!prefersReducedMotion()) setPlaying(true);
  });

  createEffect(playing, (isPlaying) => {
    if (!isPlaying) return;
    const id = setInterval(() => setStep((s) => s + 1), FRAME_MS);
    return () => clearInterval(id);
  });

  return (
    <figure class="m-0 flex justify-center">
      <pre
        role="img"
        aria-label="ASCII drawing of a menhir, a tall standing stone, turning slowly."
        class="m-0 overflow-hidden bg-transparent p-0 font-mono text-[min(0.5rem,1.25vw)] leading-none text-stone-700 dark:bg-transparent dark:text-stone-300"
      >
        {frame()}
      </pre>
    </figure>
  );
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
