import { createEffect, createMemo, createSignal, onSettled } from "solid-js";

import { sceneStepAt } from "../timeOfDay";
import { sceneFrame } from "./menhirFrames";

/** Time between frames. A full day and night takes CYCLE_STEPS frames. */
export const FRAME_MS = 200;

/**
 * The front page's ASCII animation of a menhir through a day and a night.
 * It opens on the frame for the reader's time of day, with the stone of the
 * day, and plays once mounted unless the reader prefers reduced motion.
 * Each dawn in the animation brings the next stone. The button pauses and
 * resumes it, since moving content that lasts more than five seconds needs a
 * way to stop it (WCAG 2.2.2).
 */
export default function MenhirScene() {
  const [step, setStep] = createSignal(sceneStepAt(new Date()));
  const [playing, setPlaying] = createSignal(false);
  const frame = createMemo(() => sceneFrame(step()));

  onSettled(() => {
    if (!prefersReducedMotion()) setPlaying(true);
  });

  createEffect(
    () => playing(),
    (isPlaying) => {
      if (!isPlaying) return;
      const id = setInterval(() => setStep((s) => s + 1), FRAME_MS);
      return () => clearInterval(id);
    },
  );

  return (
    <figure class="my-8">
      <pre
        role="img"
        aria-label="ASCII drawing of a menhir, a tall standing stone, as the sun and then the moon cross the sky over it."
        data-phase={frame().phase}
        data-stone={frame().stone}
        class={[
          "m-0 overflow-hidden text-center font-mono text-[min(0.875rem,2.2vw)] leading-tight transition-colors duration-1000",
          frame().phase === "day"
            ? "bg-sky-50 text-stone-700"
            : "bg-slate-900 text-slate-200",
        ]}
      >
        {frame().text}
      </pre>
      <figcaption class="mt-2 flex justify-end">
        <button
          type="button"
          class="rounded border border-stone-300 px-2 py-0.5 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing() ? "Pause animation" : "Play animation"}
        </button>
      </figcaption>
    </figure>
  );
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
