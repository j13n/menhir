// The test list and the cases left out are in ../README.md.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterFlush, createRenderer, screen } from "#test-utils";

import { enter, leave, wait } from "../../../test/floating/hover/helpers.ts";
import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { Tooltip } from "../index.ts";

const trigger = (name: string) => screen.getByRole("button", { name });
const isOpen = (name: string) =>
  screen.getByTestId(name).matches(":popover-open");

/** A tooltip on a button named `name`, whose Popup has that test id. */
function Tip(props: { name: string; delay?: number }) {
  return (
    <Tooltip.Root delay={props.delay}>
      <Tooltip.Trigger>{props.name}</Tooltip.Trigger>
      <Tooltip.Popup data-testid={props.name}>{props.name} tip</Tooltip.Popup>
    </Tooltip.Root>
  );
}

describe("<Tooltip.Group />", () => {
  const { render } = createRenderer();
  stubPopover();
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders no element of its own", async () => {
    const { container } = await render(() => (
      <Tooltip.Group>
        <span>Inside</span>
      </Tooltip.Group>
    ));

    expect(container.innerHTML).toBe("<span>Inside</span>");
  });

  it("opens another tooltip of the group at once while one is open, and closes the first", async () => {
    await render(() => (
      <Tooltip.Group>
        <Tip name="Bold" />
        <Tip name="Italic" />
      </Tooltip.Group>
    ));
    enter(trigger("Bold"));
    await wait(600);
    expect(isOpen("Bold")).toBe(true);

    enter(trigger("Italic"));
    await afterFlush();

    expect(isOpen("Italic")).toBe(true);
    expect(isOpen("Bold")).toBe(false);
  });

  it("opens the next at once within timeout of the last closing, and after it waits the delay", async () => {
    await render(() => (
      <Tooltip.Group timeout={300}>
        <Tip name="Bold" />
        <Tip name="Italic" />
      </Tooltip.Group>
    ));
    enter(trigger("Bold"));
    await wait(600);
    leave(trigger("Bold"));
    await wait(299);

    enter(trigger("Italic"));
    await afterFlush();
    expect(isOpen("Italic")).toBe(true);
    leave(trigger("Italic"));
    await wait(300);

    enter(trigger("Bold"));
    await wait(599);
    expect(isOpen("Bold")).toBe(false);
    await wait(1);
    expect(isOpen("Bold")).toBe(true);
  });

  it("gives its delay to a Root without one, and lets a Root's own win", async () => {
    await render(() => (
      <Tooltip.Group delay={200}>
        <Tip name="Bold" />
        <Tip name="Italic" delay={50} />
      </Tooltip.Group>
    ));

    enter(trigger("Italic"));
    await wait(50);
    expect(isOpen("Italic")).toBe(true);
    leave(trigger("Italic"));
    // Past the group's timeout, so the next waits its delay.
    await wait(400);

    enter(trigger("Bold"));
    await wait(199);
    expect(isOpen("Bold")).toBe(false);
    await wait(1);
    expect(isOpen("Bold")).toBe(true);
  });

  it("leaves a tooltip outside the group to wait its delay while one inside is open", async () => {
    await render(() => (
      <>
        <Tooltip.Group>
          <Tip name="Bold" />
        </Tooltip.Group>
        <Tip name="Help" />
      </>
    ));
    enter(trigger("Bold"));
    await wait(600);

    enter(trigger("Help"));
    await wait(599);
    expect(isOpen("Help")).toBe(false);
    expect(isOpen("Bold")).toBe(true);
    await wait(1);
    expect(isOpen("Help")).toBe(true);
  });
});
