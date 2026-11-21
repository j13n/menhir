import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { tsx } from "../highlight";
import CodeBlock from "./CodeBlock";

describe("CodeBlock", () => {
  test("shows the code, each token in a span the theme colours", () => {
    const { container } = render(() => (
      <CodeBlock code={tsx`const label = "<b>";`} class="m-0" />
    ));
    const pre = container.querySelector("pre")!;
    expect(pre).toHaveClass("th-code", "m-0");
    expect(pre).toHaveAttribute("data-language", "tsx");
    expect(pre.querySelector("code")!.textContent).toBe('const label = "<b>";');
    expect(pre.querySelector(".th-keyword")).toHaveTextContent("const");
    expect(pre.querySelector("b")).toBeNull();
  });
});
