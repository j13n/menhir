// The test list and the cases left out are in ../README.md.
import { createSignal, Errored, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import {
  createRenderer,
  describeConformance,
  fireEvent,
  screen,
} from "#test-utils";

import { Avatar } from "../index.ts";

describeConformance(
  "<Avatar.Fallback />",
  (props) => (
    <Avatar.Root>
      <Avatar.Fallback {...props}>JD</Avatar.Fallback>
    </Avatar.Root>
  ),
  { tagName: "SPAN" },
);

describe("<Avatar.Fallback />", () => {
  const { render } = createRenderer();

  function TestAvatar(props: { src: string | undefined }) {
    return (
      <Avatar.Root>
        <Avatar.Image src={props.src} alt="Jane Doe" />
        <Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
      </Avatar.Root>
    );
  }

  it("renders a span with its children while idle", async () => {
    await render(() => <TestAvatar src={undefined} />);

    const fallback = screen.getByTestId("fallback");
    expect(fallback.tagName).toBe("SPAN");
    expect(fallback).toHaveTextContent("JD");
    expect(fallback).toHaveAttribute("data-idle", "");
  });

  it("stays while the picture loads and after it fails, and is removed once loaded", async () => {
    const [src, setSrc] = createSignal("/jane.png");
    await render(() => <TestAvatar src={src()} />);
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-loading", "");

    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-error", "");

    setSrc("/john.png");
    flush();
    fireEvent.load(screen.getByRole("img"));
    expect(screen.queryByTestId("fallback")).toBeNull();
  });

  it("is aria-hidden while the picture loads, and not while idle or failed", async () => {
    const [src, setSrc] = createSignal<string | undefined>(undefined);
    await render(() => <TestAvatar src={src()} />);
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");

    setSrc("/jane.png");
    flush();
    expect(screen.getByTestId("fallback")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");
  });

  it("keeps the consumer's aria-hidden", async () => {
    await render(() => (
      <Avatar.Root>
        <Avatar.Fallback data-testid="fallback" aria-hidden="true">
          JD
        </Avatar.Fallback>
      </Avatar.Root>
    ));

    expect(screen.getByTestId("fallback")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("is named by role img and aria-label once the picture has failed", async () => {
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src="/jane.png" alt="Jane Doe" />
        <Avatar.Fallback role="img" aria-label="Jane Doe">
          JD
        </Avatar.Fallback>
      </Avatar.Root>
    ));
    // While it loads, the img alone has the name.
    expect(screen.getAllByRole("img", { name: "Jane Doe" })).toHaveLength(1);
    expect(screen.getByRole("img").tagName).toBe("IMG");

    fireEvent.error(screen.getByRole("img"));

    const named = screen.getByRole("img", { name: "Jane Doe" });
    expect(named.tagName).toBe("SPAN");
    expect(named).toHaveTextContent("JD");
  });

  it("throws a descriptive error outside <Avatar.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Avatar parts must be placed within <Avatar.Root>.",
      ),
    ).toBeInTheDocument();
  });
});
