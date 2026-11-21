// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";

import { createSignal, flush } from "solid-js";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { Separator } from "../index.ts";

describeConformance(
  "<Separator.Root />",
  (props) => <Separator.Root {...props} />,
  { tagName: "DIV" },
);

describe("<Separator.Root />", () => {
  const { render } = createRenderer();

  it("renders a div with role separator", async () => {
    await render(() => <Separator.Root />);

    expect(screen.getByRole("separator").tagName).toBe("DIV");
  });

  describe("orientation", () => {
    it("is horizontal by default", async () => {
      await render(() => <Separator.Root />);

      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        "horizontal",
      );
    });

    it("can be vertical", async () => {
      await render(() => <Separator.Root orientation="vertical" />);

      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        "vertical",
      );
    });

    it("puts its orientation in data attributes, exactly one of them", async () => {
      await render(() => (
        <>
          <Separator.Root data-testid="horizontal" />
          <Separator.Root data-testid="vertical" orientation="vertical" />
        </>
      ));

      const horizontal = screen.getByTestId("horizontal");
      expect(horizontal).toHaveAttribute("data-horizontal", "");
      expect(horizontal).not.toHaveAttribute("data-vertical");
      const vertical = screen.getByTestId("vertical");
      expect(vertical).toHaveAttribute("data-vertical", "");
      expect(vertical).not.toHaveAttribute("data-horizontal");
    });

    it("follows orientation changing while rendered", async () => {
      const [orientation, setOrientation] = createSignal<
        "horizontal" | "vertical"
      >("horizontal");
      await render(() => <Separator.Root orientation={orientation()} />);

      const separator = screen.getByRole("separator");
      setOrientation("vertical");
      flush();
      expect(separator).toHaveAttribute("aria-orientation", "vertical");
      expect(separator).toHaveAttribute("data-vertical", "");
      expect(separator).not.toHaveAttribute("data-horizontal");

      setOrientation("horizontal");
      flush();
      expect(separator).toHaveAttribute("aria-orientation", "horizontal");
      expect(separator).toHaveAttribute("data-horizontal", "");
      expect(separator).not.toHaveAttribute("data-vertical");
    });
  });

  it("is not focusable: Tab moves past it", async () => {
    const { user } = await render(() => (
      <>
        <button type="button">Before</button>
        <Separator.Root />
        <button type="button">After</button>
      </>
    ));

    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.keyboard("[Tab]");
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(screen.getByRole("separator")).not.toHaveAttribute("tabindex");
  });

  describe("names", () => {
    it("is named by aria-label", async () => {
      await render(() => <Separator.Root aria-label="Archived" />);

      expect(
        screen.getByRole("separator", { name: "Archived" }),
      ).toBeInTheDocument();
    });

    it.each([
      ["aria-labelledby", "archived-label"],
      ["aria-describedby", "archived-description"],
    ])("passes %s through", async (name, value) => {
      await render(() => <Separator.Root {...{ [name]: value }} />);

      expect(screen.getByRole("separator")).toHaveAttribute(name, value);
    });
  });

  it("lets the consumer's attributes override its own", async () => {
    // Shows that the consumer's value wins; `orientation` is the prop to use.
    await render(() => <Separator.Root aria-orientation="vertical" />);

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("keeps its role and orientation when rendered as an hr", async () => {
    await render(() => (
      <Separator.Root
        orientation="vertical"
        render={(props) => <hr {...props} />}
      />
    ));

    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("data-vertical", "");
  });
});
