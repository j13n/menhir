// The Input is the form's control. The test list and the cases left out are
// in ../README.md.
import { afterEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { stubMenu } from "../../../test/menu/stubMenu.ts";
import { City } from "../../../test/autocomplete/City.tsx";
import { input, item } from "../../../test/autocomplete/queries.ts";
import type { AutocompleteRootProps } from "../root/AutocompleteRoot.tsx";

const form = () => screen.getByTestId<HTMLFormElement>("form");
const submitted = () => Object.fromEntries(new FormData(form()));
const button = (name: string) => screen.getByRole("button", { name });

/** A City autocomplete in a form with a submit and a reset button. */
function CityForm(props: AutocompleteRootProps & { onSubmit?: () => void }) {
  return (
    <form
      data-testid="form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.();
      }}
    >
      <City name="city" {...props} />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  );
}

describe("<Autocomplete.Input /> in a form", () => {
  const { render } = createRenderer();
  stubMenu();
  afterEach(() => vi.restoreAllMocks());

  it("takes name, form, required and disabled", async () => {
    await render(() => (
      <>
        <form id="trip" />
        <City name="city" form="trip" required disabled />
      </>
    ));

    expect(input()).toHaveAttribute("name", "city");
    expect(input()).toHaveAttribute("form", "trip");
    expect(input()).toBeRequired();
    expect(input()).toBeDisabled();
  });

  it("submits the text under its name, typed or accepted", async () => {
    const { user } = await render(() => <CityForm defaultValue="Oslo" />);
    expect(submitted()).toEqual({ city: "Oslo" });

    await user.clear(input());
    await user.type(input(), "Tromsø");
    expect(submitted()).toEqual({ city: "Tromsø" });

    await user.clear(input());
    await user.type(input(), "berg");
    await user.click(item("Bergen"));
    await afterFlush();
    expect(submitted()).toEqual({ city: "Bergen" });
  });

  it("submits nothing while disabled", async () => {
    await render(() => <CityForm defaultValue="Oslo" disabled />);

    expect(submitted()).toEqual({});
  });

  it("required blocks submission while the text is empty, and not once any text is typed", async () => {
    const onSubmit = vi.fn();
    const { user } = await render(() => (
      <CityForm required onSubmit={onSubmit} />
    ));

    expect(form().checkValidity()).toBe(false);
    await user.click(button("Send"));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(input(), "Tromsø");
    await afterFlush();
    expect(form().checkValidity()).toBe(true);
    await user.click(button("Send"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("a form reset puts back defaultValue", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <CityForm defaultValue="Oslo" onValueChange={onValueChange} />
    ));
    await user.clear(input());
    await user.type(input(), "Tromsø");
    await afterFlush();

    await user.click(button("Reset"));
    await afterFlush();

    expect(onValueChange).toHaveBeenLastCalledWith("Oslo", {
      reason: "reset",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("Oslo");
    expect(submitted()).toEqual({ city: "Oslo" });
  });

  it("a form reset only asks when controlled", async () => {
    const onValueChange = vi.fn();
    const { user } = await render(() => (
      <CityForm
        value="Bergen"
        defaultValue="Oslo"
        onValueChange={onValueChange}
      />
    ));

    await user.click(button("Reset"));
    await afterFlush();

    expect(onValueChange).toHaveBeenCalledWith("Oslo", {
      reason: "reset",
      event: expect.any(Event),
    });
    expect(input()).toHaveValue("Bergen");
  });
});
