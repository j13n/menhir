import { For } from "solid-js";

import "./native-scroller.css";

const releases = Array.from(
  { length: 24 },
  (_, index) => `Release 2.${24 - index}`,
);

// No component: a scroller that takes focus, so the keys scroll it in every
// browser, named for screen readers.
export default function NativeScroller() {
  return (
    <div class="scroller" tabindex="0" role="region" aria-label="Releases">
      <For each={releases}>{(release) => <p>{release}</p>}</For>
    </div>
  );
}
