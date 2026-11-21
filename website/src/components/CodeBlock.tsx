import "virtual:highlight-theme.css";
import { For } from "solid-js";

import type { Highlighted } from "../highlight";

/**
 * Highlighted code, from a tag of src/highlight.ts or a `?highlight` import:
 * each token a span with the classes `virtual:highlight-theme.css` colours.
 */
export default function CodeBlock(props: {
  code: Highlighted;
  class?: string;
}) {
  return (
    <pre class={["th-code", props.class]} data-language={props.code.lang}>
      <code>
        <For each={props.code.tokens}>
          {(token) =>
            typeof token === "string" ? (
              token
            ) : (
              <span class={`th-token th-${token[0]}`}>{token[1]}</span>
            )
          }
        </For>
      </code>
    </pre>
  );
}
