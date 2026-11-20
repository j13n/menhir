// The conventions every part that renders an element follows (PLAN.md
// section 8, "Polymorphism" and "API conventions"), as a suite each part's
// tests run.
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, merge } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import type { RenderProp } from "../src/core/renderElement.tsx";
import { createRenderer } from "./createRenderer.ts";
import { fireEvent, screen } from "@solidjs/testing-library";

/** The props the suite passes to the part. */
export type ConformanceProps = JSX.HTMLAttributes<HTMLElement> & {
  render?: RenderProp;
};

interface ConformanceOptions {
  /** The tag name of the part's default element, such as `"BUTTON"`. */
  tagName: string;
}

const testId = "conformance";
const plainTestId = "conformance-plain";

// Attributes whose value is an id, which differs between two copies of a
// part that generates one.
const idAttributes = new Set([
  "id",
  "for",
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
]);

/** The attributes the part sets itself, other than ids, class and style. */
function ownAttributes(element: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(element.attributes)
      .filter(
        ({ name }) =>
          !idAttributes.has(name) &&
          !["data-testid", "class", "style"].includes(name),
      )
      .map(({ name, value }) => [name, value]),
  );
}

/**
 * Runs the part conventions against one part. `renderPart` renders the
 * part, with anything it needs around it, and spreads the props it is given
 * onto the part:
 *
 * ```tsx
 * describeConformance(
 *   "<Switch.Thumb />",
 *   (props) => <Switch.Root><Switch.Thumb {...props} /></Switch.Root>,
 *   { tagName: "SPAN" },
 * );
 * ```
 */
export function describeConformance(
  name: string,
  renderPart: (props: ConformanceProps) => JSX.Element,
  options: ConformanceOptions,
) {
  // An element of the part's own tag, for render functions to return.
  const PartTag = dynamic(() => options.tagName.toLowerCase());

  describe(`${name} conformance`, () => {
    const { render } = createRenderer();
    const part = () => screen.getByTestId(testId);
    const plain = () => screen.getByTestId(plainTestId);
    // `merge`, not a spread, which would read a getter's value once.
    const renderWith = (props: ConformanceProps = {}) =>
      render(() => renderPart(merge({ "data-testid": testId }, props)));
    // The part twice, without and with the consumer's props, to check that
    // what the consumer passes adds to the part's own and replaces none of
    // it (PLAN.md section 8, "Props go on the part").
    const renderBeside = (props: ConformanceProps) =>
      render(() => (
        <>
          {renderPart({ "data-testid": plainTestId })}
          {renderPart(merge({ "data-testid": testId }, props))}
        </>
      ));

    it(`renders a <${options.tagName.toLowerCase()}> by default`, async () => {
      await renderWith();

      expect(part().tagName).toBe(options.tagName);
    });

    it("passes attributes it does not own to its element", async () => {
      await renderWith({ "data-conformance": "yes", title: "Conformance" });

      expect(part()).toHaveAttribute("data-conformance", "yes");
      expect(part()).toHaveAttribute("title", "Conformance");
    });

    it("keeps its own class and style alongside the consumer's", async () => {
      await renderBeside({
        class: "consumer",
        style: { "--conformance": "1" },
      });

      expect([...part().classList]).toEqual([...plain().classList, "consumer"]);
      for (const property of plain().style) {
        expect(part().style.getPropertyValue(property)).toBe(
          plain().style.getPropertyValue(property),
        );
      }
      expect(part().style.getPropertyValue("--conformance")).toBe("1");
    });

    it("hands the consumer's ref the element, and keeps its own ref", async () => {
      const ref = vi.fn();
      await renderBeside({ ref });

      expect(ref).toHaveBeenCalledWith(part());
      expect(ownAttributes(part())).toEqual(ownAttributes(plain()));
    });

    it("runs the consumer's event handler, and keeps its own", async () => {
      const onClick = vi.fn();
      await renderBeside({ onClick });

      fireEvent.click(plain());
      fireEvent.click(part());

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(ownAttributes(part())).toEqual(ownAttributes(plain()));
    });

    it("keeps the consumer's props reactive", async () => {
      const [title, setTitle] = createSignal("Before");
      // A getter, as JSX passes a prop it reads from a signal.
      await renderWith({
        get title() {
          return title();
        },
      });

      setTitle("After");
      flush();

      expect(part()).toHaveAttribute("title", "After");
    });

    it("renders through a render function, which gets the element's props", async () => {
      await renderWith({
        class: "consumer",
        render: (props) => <PartTag data-rendered="" {...props} />,
      });

      expect(part()).toHaveAttribute("data-rendered", "");
      expect(part()).toHaveClass("consumer");
    });

    it("reads the render function once", async () => {
      const first: RenderProp = (props) => (
        <PartTag data-render="first" {...props} />
      );
      const second: RenderProp = (props) => (
        <PartTag data-render="second" {...props} />
      );
      // In an object: a function passed to createSignal is a derivation.
      const [current, setCurrent] = createSignal({ render: first });
      await renderWith({
        get render() {
          return current().render;
        },
      });
      const element = part();

      setCurrent({ render: second });
      flush();

      expect(part()).toBe(element);
      expect(part()).toHaveAttribute("data-render", "first");
    });
  });
}
