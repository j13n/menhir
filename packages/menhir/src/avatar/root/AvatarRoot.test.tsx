// The test list and the cases left out are in ../README.md.
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  afterFlush,
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Avatar } from "../index.ts";

describeConformance("<Avatar.Root />", (props) => <Avatar.Root {...props} />, {
  tagName: "SPAN",
});

describe("<Avatar.Root />", () => {
  const { render } = createRenderer();

  it("renders a span with its children, data-idle with no Image", async () => {
    await render(() => (
      <Avatar.Root data-testid="root">
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveTextContent("JD");
    expect(root).toHaveAttribute("data-idle", "");
    expect(root).not.toHaveAttribute("data-loading");
  });

  it("is data-loading once an Image with a src is mounted", async () => {
    await render(() => (
      <Avatar.Root data-testid="root">
        <Avatar.Image src="/jane.png" alt="Jane Doe" />
      </Avatar.Root>
    ));

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-loading", "");
    expect(root).not.toHaveAttribute("data-idle");
  });

  it("is data-loaded on the Image's load, exactly one of the four", async () => {
    await render(() => (
      <Avatar.Root data-testid="root">
        <Avatar.Image src="/jane.png" alt="Jane Doe" />
      </Avatar.Root>
    ));

    fireEvent.load(screen.getByRole("img"));

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-loaded", "");
    for (const other of ["data-idle", "data-loading", "data-error"]) {
      expect(root).not.toHaveAttribute(other);
    }
  });

  it("is data-error on the Image's error", async () => {
    await render(() => (
      <Avatar.Root data-testid="root">
        <Avatar.Image src="/jane.png" alt="Jane Doe" />
      </Avatar.Root>
    ));

    fireEvent.error(screen.getByRole("img"));

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-error", "");
    expect(root).not.toHaveAttribute("data-loading");
  });

  it("calls onLoadingStatusChange with each status it moves to, not the first idle", async () => {
    const onLoadingStatusChange = vi.fn();
    await render(() => (
      <Avatar.Root onLoadingStatusChange={onLoadingStatusChange}>
        <Avatar.Image src="/jane.png" alt="Jane Doe" />
      </Avatar.Root>
    ));
    await afterFlush();
    expect(onLoadingStatusChange.mock.calls).toEqual([["loading"]]);

    fireEvent.load(screen.getByRole("img"));
    await afterFlush();

    expect(onLoadingStatusChange.mock.calls).toEqual([["loading"], ["loaded"]]);
  });

  it("calls onLoadingStatusChange with error, and loading again when src changes", async () => {
    const onLoadingStatusChange = vi.fn();
    const [src, setSrc] = createSignal("/jane.png");
    await render(() => (
      <Avatar.Root onLoadingStatusChange={onLoadingStatusChange}>
        <Avatar.Image src={src()} alt="Jane Doe" />
      </Avatar.Root>
    ));
    await afterFlush();

    fireEvent.error(screen.getByRole("img"));
    await afterFlush();
    setSrc("/john.png");
    flush();
    await afterFlush();

    expect(onLoadingStatusChange.mock.calls).toEqual([
      ["loading"],
      ["error"],
      ["loading"],
    ]);
  });

  it("does not call onLoadingStatusChange without an Image", async () => {
    const onLoadingStatusChange = vi.fn();
    await render(() => (
      <Avatar.Root onLoadingStatusChange={onLoadingStatusChange}>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar.Root>
    ));
    await afterFlush();

    expect(onLoadingStatusChange).not.toHaveBeenCalled();
  });

  it("is data-idle again when the Image is removed", async () => {
    const [shown, setShown] = createSignal(true);
    await render(() => (
      <Avatar.Root data-testid="root">
        <Show when={shown()}>
          <Avatar.Image src="/jane.png" alt="Jane Doe" />
        </Show>
      </Avatar.Root>
    ));
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-loading", "");

    setShown(false);
    flush();

    expect(root).toHaveAttribute("data-idle", "");
  });
});
