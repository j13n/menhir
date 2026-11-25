// The test list and the cases left out are in ../README.md.
import { Errored } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, screen } from "#test-utils";

import { createToastManager, Toast } from "../index.ts";

describe("<Toast.Provider />", () => {
  const { render } = createRenderer();

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Toast.Provider manager={createToastManager()}>
        <span>Inside</span>
      </Toast.Provider>
    ));
    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("is required by the Region, which says so", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Toast.Region>{() => null}</Toast.Region>
      </Errored>
    ));
    expect(
      screen.getByText(
        "Error: [menhir] Toast parts must be placed within <Toast.Provider>.",
      ),
    ).toBeInTheDocument();
  });
});
