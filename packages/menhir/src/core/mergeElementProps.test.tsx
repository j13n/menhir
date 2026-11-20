import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { mergeElementProps } from "./mergeElementProps.ts";
import type { ElementProps } from "./renderElement.tsx";

// Each test part merges in its body, as a part does, not inline in JSX: a
// spread's expression is tracked, so an inline call would run again on every
// change and hide whether the merged props are reactive themselves.
describe("mergeElementProps", () => {
  const { render } = createRenderer();

  it("calls the consumer's handler, then the part's", async () => {
    const calls: string[] = [];
    function Part(props: ElementProps) {
      const own: ElementProps = { onClick: () => calls.push("part") };
      const elementProps = mergeElementProps(own, props);
      return <span data-testid="part" {...elementProps} />;
    }
    const { user } = await render(() => (
      <Part onClick={() => calls.push("consumer")} />
    ));

    await user.click(screen.getByTestId("part"));

    expect(calls).toEqual(["consumer", "part"]);
  });

  it("keeps the part's class and the consumer's, in any class form", async () => {
    function Part(props: ElementProps) {
      const own: ElementProps = { class: "part" };
      const elementProps = mergeElementProps(own, props);
      return <span data-testid="part" {...elementProps} />;
    }
    await render(() => (
      <>
        <Part data-testid="string" class="mine" />
        <Part data-testid="object" class={{ mine: true, off: false }} />
        <Part data-testid="array" class={["mine", { also: true }]} />
      </>
    ));

    expect(screen.getByTestId("string")).toHaveClass("part mine", {
      exact: true,
    });
    expect(screen.getByTestId("object")).toHaveClass("part mine", {
      exact: true,
    });
    expect(screen.getByTestId("array")).toHaveClass("part mine also", {
      exact: true,
    });
  });

  it("combines the part's style with the consumer's, which wins a conflict", async () => {
    function Part(props: ElementProps) {
      const own: ElementProps = {
        style: { "--part": "1", color: "red", display: "block" },
      };
      const elementProps = mergeElementProps(own, props);
      return <span data-testid="part" {...elementProps} />;
    }
    await render(() => (
      <>
        <Part data-testid="object" style={{ color: "blue" }} />
        {/* The string form is the case under test. */}
        {/* oxlint-disable-next-line solid/style-prop */}
        <Part data-testid="string" style="color: green; margin: 0" />
      </>
    ));

    const object = screen.getByTestId("object").style;
    expect(object.getPropertyValue("--part")).toBe("1");
    expect(object.display).toBe("block");
    expect(object.color).toBe("blue");
    const string = screen.getByTestId("string").style;
    expect(string.getPropertyValue("--part")).toBe("1");
    expect(string.display).toBe("block");
    expect(string.color).toBe("green");
    expect(string.margin).toBe("0px");
  });

  it("runs the consumer's ref and the part's, in any ref form", async () => {
    // A ref runs before the element's attributes are set, so record the
    // element and identify it after rendering.
    const seen: [string, HTMLElement][] = [];
    function Part(props: JSX.HTMLAttributes<HTMLElement>) {
      const own: ElementProps = {
        ref: (element) => seen.push(["part", element]),
      };
      const elementProps = mergeElementProps(own, props);
      return <span {...elementProps} />;
    }
    let variable: HTMLElement | undefined;
    await render(() => (
      <>
        <Part
          data-testid="callback"
          ref={(element) => seen.push(["consumer", element])}
        />
        <Part data-testid="variable" ref={variable} />
        <Part
          data-testid="array"
          ref={[
            (element) => seen.push(["first", element]),
            (element) => seen.push(["second", element]),
          ]}
        />
      </>
    ));

    const callback = screen.getByTestId("callback");
    const array = screen.getByTestId("array");
    expect(seen).toEqual([
      ["consumer", callback],
      ["part", callback],
      ["part", screen.getByTestId("variable")],
      ["first", array],
      ["second", array],
      ["part", array],
    ]);
    expect(variable).toBe(screen.getByTestId("variable"));
  });

  it("hands on one ref callback when only the consumer passes a ref", async () => {
    const seen: string[] = [];
    let handedOn: unknown;
    function Part(props: JSX.HTMLAttributes<HTMLElement>) {
      const elementProps = mergeElementProps({ role: "switch" }, props);
      handedOn = elementProps.ref;
      return <span {...elementProps} />;
    }
    await render(() => (
      <Part ref={[() => seen.push("first"), () => seen.push("second")]} />
    ));

    expect(handedOn).toBeTypeOf("function");
    expect(seen).toEqual(["first", "second"]);
  });

  it("follows the consumer's props when they change", async () => {
    const calls: string[] = [];
    function Part(props: ElementProps) {
      const own: ElementProps = {
        class: "part",
        style: { display: "block" },
        onClick: () => calls.push("part"),
      };
      const elementProps = mergeElementProps(own, props);
      return <span data-testid="part" {...elementProps} />;
    }
    const [variant, setVariant] = createSignal<"a" | "b">("a");
    const { user } = await render(() => (
      <Part
        class={variant()}
        style={{ color: variant() === "a" ? "red" : "blue" }}
        title={variant()}
        onClick={
          variant() === "a" ? () => calls.push("a") : () => calls.push("b")
        }
      />
    ));
    const element = screen.getByTestId("part");

    setVariant("b");
    flush();
    await user.click(element);

    expect(element).toHaveClass("part b", { exact: true });
    expect(element.style.color).toBe("blue");
    expect(element.style.display).toBe("block");
    expect(element).toHaveAttribute("title", "b");
    expect(calls).toEqual(["b", "part"]);
  });
});
