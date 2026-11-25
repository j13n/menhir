// The test list and the cases left out are in ../README.md.
import { createSignal, Errored, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  createRenderer,
  describeConformance,
  fireEvent,
  isJSDOM,
  screen,
} from "#test-utils";

import { broken, picture } from "../../../test/avatar/AvatarFixture.tsx";
import { Avatar } from "../index.ts";

const src = "/jane.png";

describeConformance(
  "<Avatar.Image />",
  (props) => (
    <Avatar.Root>
      <Avatar.Image src={src} alt="Jane Doe" {...props} />
    </Avatar.Root>
  ),
  { tagName: "IMG" },
);

describe("<Avatar.Image />", () => {
  const { render } = createRenderer();

  it("renders an img with its src and alt, data-loading, while it loads", async () => {
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={src} alt="Jane Doe" />
      </Avatar.Root>
    ));

    const image = screen.getByRole("img", { name: "Jane Doe" });
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", src);
    expect(image).toHaveAttribute("data-loading", "");
    expect(image).not.toHaveAttribute("data-idle");
  });

  it("stays after load, with data-loaded", async () => {
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={src} alt="Jane Doe" />
      </Avatar.Root>
    ));
    const image = screen.getByRole("img");

    fireEvent.load(image);

    expect(screen.getByRole("img")).toBe(image);
    expect(image).toHaveAttribute("data-loaded", "");
    expect(image).not.toHaveAttribute("data-loading");
  });

  it("is removed on error", async () => {
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={src} alt="Jane Doe" />
      </Avatar.Root>
    ));

    fireEvent.error(screen.getByRole("img"));

    expect(screen.queryByRole("img")).toBeNull();
  });

  it.each([undefined, ""])(
    "renders nothing without a src (%j), and the status is idle",
    async (noSrc) => {
      await render(() => (
        <Avatar.Root data-testid="root">
          <Avatar.Image src={noSrc} alt="Jane Doe" />
        </Avatar.Root>
      ));

      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByTestId("root")).toHaveAttribute("data-idle", "");
    },
  );

  it("starts over at loading when src changes after a load", async () => {
    const [current, setCurrent] = createSignal(src);
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={current()} alt="Jane Doe" />
      </Avatar.Root>
    ));
    const image = screen.getByRole("img");
    fireEvent.load(image);

    setCurrent("/john.png");
    flush();

    expect(image).toHaveAttribute("src", "/john.png");
    expect(image).toHaveAttribute("data-loading", "");
    fireEvent.load(image);
    expect(image).toHaveAttribute("data-loaded", "");
  });

  it("renders the img again with the new src after an error", async () => {
    const [current, setCurrent] = createSignal(src);
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={current()} alt="Jane Doe" />
      </Avatar.Root>
    ));
    fireEvent.error(screen.getByRole("img"));

    setCurrent("/john.png");
    flush();

    const image = screen.getByRole("img", { name: "Jane Doe" });
    expect(image).toHaveAttribute("src", "/john.png");
    expect(image).toHaveAttribute("data-loading", "");
  });

  it("is loaded at once going back to a src that loaded", async () => {
    const [current, setCurrent] = createSignal(src);
    await render(() => (
      <Avatar.Root>
        <Avatar.Image src={current()} alt="Jane Doe" />
      </Avatar.Root>
    ));
    const image = screen.getByRole("img");
    fireEvent.load(image);
    setCurrent("/john.png");
    flush();

    setCurrent(src);
    flush();

    expect(image).toHaveAttribute("data-loaded", "");
  });

  it("runs the consumer's onLoad and onError beside its own", async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const [current, setCurrent] = createSignal(src);
    await render(() => (
      <Avatar.Root>
        <Avatar.Image
          src={current()}
          alt="Jane Doe"
          onLoad={onLoad}
          onError={onError}
        />
      </Avatar.Root>
    ));
    const image = screen.getByRole("img");

    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(image).toHaveAttribute("data-loaded", "");

    setCurrent("/john.png");
    flush();
    fireEvent.error(image);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("throws a descriptive error outside <Avatar.Root>", async () => {
    await render(() => (
      <Errored fallback={(error) => <p>{String(error())}</p>}>
        <Avatar.Image src={src} alt="Jane Doe" />
      </Errored>
    ));

    expect(
      screen.getByText(
        "Error: [menhir] Avatar parts must be placed within <Avatar.Root>.",
      ),
    ).toBeInTheDocument();
  });

  describe("with a real picture", () => {
    function renderAvatar(url: string) {
      return render(() => (
        <Avatar.Root data-testid="root">
          <Avatar.Image src={url} alt="Jane Doe" />
          <Avatar.Fallback data-testid="fallback">JD</Avatar.Fallback>
        </Avatar.Root>
      ));
    }

    it.skipIf(isJSDOM)(
      "is loaded on every part once it loads, and the Fallback is removed",
      async () => {
        await renderAvatar(picture);
        const image = screen.getByRole("img");

        await expect
          .poll(() => screen.getByTestId("root").hasAttribute("data-loaded"))
          .toBe(true);
        expect(image).toHaveAttribute("data-loaded", "");
        expect(screen.queryByTestId("fallback")).toBeNull();
      },
    );

    it.skipIf(isJSDOM)(
      "is an error once it fails, and the img is removed",
      async () => {
        await renderAvatar(broken);

        await expect
          .poll(() => screen.getByTestId("root").hasAttribute("data-error"))
          .toBe(true);
        expect(screen.queryByRole("img")).toBeNull();
        expect(screen.getByTestId("fallback")).toHaveAttribute(
          "data-error",
          "",
        );
      },
    );
  });
});
