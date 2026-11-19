import { createSignal, onSettled } from "solid-js";
import { describe, expect, it, onTestFinished } from "vitest";

import { createRenderer, fireEvent } from "#test-utils";

function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Clicked {count()} times
    </button>
  );
}

describe("createRenderer", () => {
  const { render } = createRenderer();

  it("mounts the UI in the document and returns queries", async () => {
    const { getByRole } = await render(() => (
      <button type="button">Save</button>
    ));

    expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("returns a user that drives the UI, with updates applied when its actions resolve", async () => {
    const { user, getByRole } = await render(() => <Counter />);
    await user.click(getByRole("button"));

    expect(getByRole("button")).toHaveTextContent("Clicked 1 times");
  });

  it("applies updates before fireEvent returns, so assertions can follow it directly", async () => {
    const { getByRole } = await render(() => <Counter />);
    fireEvent.click(getByRole("button"));

    expect(getByRole("button")).toHaveTextContent("Clicked 1 times");
  });

  it("applies updates made while mounting before render resolves", async () => {
    function Greeting() {
      const [text, setText] = createSignal("Mounting");
      onSettled(() => {
        setText("Mounted");
      });
      return <p>{text()}</p>;
    }

    // Not awaited yet: nothing but render itself may apply the update.
    const pending = render(() => <Greeting />);
    expect(document.body).toHaveTextContent("Mounted");
    await pending;
  });

  it("removes the rendered UI from the document after the test", async () => {
    // Runs after the afterEach hooks, so it sees what the next test would.
    onTestFinished(() => {
      expect(document.body.children).toHaveLength(0);
    });

    await render(() => <p>Left over</p>);
    expect(document.body.children).toHaveLength(1);
  });
});
