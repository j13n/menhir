// A test part for the `core` helpers, shared by the client tests and the
// hydration fixture.
import type { JSX } from "@solidjs/web";
import { createSignal, omit } from "solid-js";

import { mergeElementProps } from "../../src/core/mergeElementProps.ts";
import { renderElement } from "../../src/core/renderElement.tsx";
import type {
  ElementProps,
  RenderProp,
} from "../../src/core/renderElement.tsx";

// A part with a role and a default <span>, built the way PLAN.md section 8
// ("Polymorphism") says a part calls the helper.
export function Part(
  props: JSX.HTMLAttributes<HTMLElement> & { render?: RenderProp },
) {
  const [checked, setChecked] = createSignal(false);
  const own: ElementProps = {
    role: "switch",
    get "aria-checked"() {
      return checked() ? "true" : "false";
    },
    class: "part",
    style: { "--part": "1" },
    onClick: () => setChecked((value) => !value),
    // Marks the element, so a test can tell that the part's ref ran.
    ref: (element) => element.setAttribute("data-part-ref", ""),
  };
  const elementProps = mergeElementProps(own, omit(props, "render"));
  return renderElement(props, elementProps, (p) => <span {...p} />);
}

// A component a styled layer might pass as `render`.
export function Button(props: JSX.IntrinsicElements["button"]) {
  return <button data-styled="" {...props} />;
}
