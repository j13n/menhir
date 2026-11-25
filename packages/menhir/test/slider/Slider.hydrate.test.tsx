import { afterEach, describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  renderOnServer,
  screen,
} from "#test-utils";

import SliderFixture from "./SliderFixture.tsx";

const slider = () =>
  screen.getByRole<HTMLInputElement>("slider", { name: "Year" });
const root = () => screen.getByTestId("root");

describe("<Slider.Root /> hydration", () => {
  const { render } = createRenderer();
  afterEach(() => vi.restoreAllMocks());

  it("has the input with its value, aria-valuetext and label, --slider on the Root and the Value's text in the server HTML", async () => {
    const container = await renderOnServer("/test/slider/SliderFixture.tsx");

    expect(slider()).toHaveAttribute("type", "range");
    expect(slider()).toHaveAttribute("value", "1969");
    expect(slider()).toHaveAttribute("min", "1900");
    expect(slider()).toHaveAttribute("max", "2100");
    expect(slider()).toHaveAttribute("name", "year");
    expect(slider()).toHaveAttribute("aria-valuetext", "1969");
    expect(root().style.getPropertyValue("--slider")).toBe("34.5%");
    expect(screen.getByTestId("value")).toHaveTextContent(/^1969$/);
    // Nothing hydrates it, so cleanup would not remove it.
    container.remove();
  });

  it("adopts the server's elements; a key changes the value, --slider and the form's data afterwards", async () => {
    const container = await renderOnServer("/test/slider/SliderFixture.tsx");
    const serverInput = container.querySelector('input[type="range"]');

    // A hydration mismatch is reported on the console, not thrown.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    const { user } = await render(() => <SliderFixture />, {
      hydrate: container,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(slider()).toBe(serverInput);

    slider().focus();
    await user.keyboard("{PageUp}");
    await afterFlush();

    expect(screen.getByTestId("year")).toHaveTextContent("1979");
    expect(slider()).toHaveAttribute("aria-valuetext", "1979");
    expect(root().style.getPropertyValue("--slider")).toBe("39.5%");
    expect(screen.getByTestId("value")).toHaveTextContent(/^1979$/);
    expect(new FormData(container.querySelector("form")!).get("year")).toBe(
      "1979",
    );
  });
});
