import { describe, expect, it } from "vitest";

import { createRenderer, renderOnServer, screen } from "#test-utils";

import IdsFixture from "./IdsFixture.tsx";

describe("ids from createUniqueId", () => {
  const { render } = createRenderer();

  it("keep the server's ids through hydration, and link label and input", async () => {
    const container = await renderOnServer("/test/core/IdsFixture.tsx");
    const serverIds = [...container.querySelectorAll("input")].map(
      (input) => input.id,
    );

    await render(() => <IdsFixture />, { hydrate: container });

    const labels = ["First", "Second", "Third", "Fourth"];
    const inputs = labels.map((label) => screen.getByLabelText(label));
    expect(inputs.map((input) => input.id)).toEqual(serverIds);
    expect(inputs[2]).toHaveAttribute("id", "chosen");
    expect(new Set(serverIds).size).toBe(4);
  });
});
