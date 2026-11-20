import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { Button, Part } from "../../test/core/Part.tsx";

describe("renderElement", () => {
  const { render } = createRenderer();

  it("renders the part's default element without a render prop", async () => {
    await render(() => <Part id="part" />);

    const element = screen.getByRole("switch");
    expect(element.tagName).toBe("SPAN");
    expect(element).toHaveAttribute("id", "part");
  });

  it("renders another element through a render function", async () => {
    const { user } = await render(() => (
      <Part render={(p) => <a {...p} href="#settings" />} />
    ));

    const element = screen.getByRole("switch");
    expect(element.tagName).toBe("A");
    expect(element).toHaveAttribute("href", "#settings");
    expect(element).not.toHaveAttribute("render");
    await user.click(element);
    expect(element).toHaveAttribute("aria-checked", "true");
  });

  it("renders a component passed as render", async () => {
    await render(() => <Part render={Button} />);

    const element = screen.getByRole("switch");
    expect(element.tagName).toBe("BUTTON");
    expect(element).toHaveAttribute("data-styled");
    expect(element).toHaveClass("part");
  });

  describe("render passed as an expression", () => {
    let logged: unknown[][] = [];
    beforeEach(() => {
      logged = [];
      for (const method of ["warn", "error"] as const) {
        vi.spyOn(console, method).mockImplementation((...args) => {
          logged.push(args);
        });
      }
    });
    afterEach(() => vi.restoreAllMocks());

    it("is read once, without a diagnostic", async () => {
      const [link, setLink] = createSignal(true);
      await render(() => (
        <Part render={link() ? (p) => <a {...p} /> : Button} />
      ));

      setLink(false);
      flush();

      expect(screen.getByRole("switch").tagName).toBe("A");
      expect(logged).toEqual([]);
    });
  });

  // Next to `{...props}` the later attribute wins (PLAN.md section 8). Props
  // the part should merge go on the part, not on the element.
  it("lets an attribute after the spread replace the part's, and drops one before it, except refs", async () => {
    const before = vi.fn();
    const after = vi.fn();
    let refBefore: HTMLElement | undefined;
    let refAfter: HTMLElement | undefined;
    const { user } = await render(() => (
      <>
        <Part
          data-testid="before"
          render={(p) => (
            <button
              onClick={before}
              class="mine"
              ref={(element) => (refBefore = element)}
              {...p}
            />
          )}
        />
        <Part
          data-testid="after"
          render={(p) => (
            <button
              {...p}
              onClick={after}
              class="mine"
              ref={(element) => (refAfter = element)}
            />
          )}
        />
      </>
    ));
    const beforeElement = screen.getByTestId("before");
    const afterElement = screen.getByTestId("after");

    await user.click(beforeElement);
    await user.click(afterElement);

    expect(before).not.toHaveBeenCalled();
    expect(beforeElement).toHaveAttribute("aria-checked", "true");
    expect(beforeElement).toHaveClass("part", { exact: true });
    // Refs are the exception: the consumer's and the part's all run.
    expect(refBefore).toBe(beforeElement);
    expect(beforeElement).toHaveAttribute("data-part-ref");
    expect(refAfter).toBe(afterElement);
    expect(afterElement).toHaveAttribute("data-part-ref");
    expect(after).toHaveBeenCalledOnce();
    expect(afterElement).toHaveAttribute("aria-checked", "false");
    expect(afterElement).toHaveClass("mine", { exact: true });
  });

  // Checked by `pnpm typecheck`, not at run time: the elements are created
  // and dropped, never rendered.
  it("types: element props spread onto any element and component", () => {
    const Link = (props: JSX.IntrinsicElements["a"]) => <a {...props} />;
    const Styled = (
      props: JSX.IntrinsicElements["button"] & { variant: "ghost" | "solid" },
    ) => <button {...props} />;
    const checks = () => [
      <Part render={(p) => <a {...p} href="/x" />} />,
      <Part render={(p) => <button {...p} type="submit" />} />,
      <Part render={(p) => <input {...p} />} />,
      <Part render={Link} />,
      <Part render={(p) => <Styled {...p} variant="ghost" />} />,
      // @ts-expect-error the part cannot pass `variant`
      <Part render={Styled} />,
      // @ts-expect-error `href` is not on every element; it goes in `render`
      <Part href="/x" />,
    ];
    expect(checks).toBeTypeOf("function");
  });
});
