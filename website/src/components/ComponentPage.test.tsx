import { render, within } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { createSignal, flush } from "solid-js";
import { describe, expect, test } from "vitest";

import ComponentPage, { type ComponentPageProps } from "./ComponentPage";

const switchPage: ComponentPageProps = {
  name: "Switch",
  description: "A control that turns a setting on or off.",
  upstream: { version: "1.9.0", folder: "switch" },
  example: () => <button type="button">Example switch</button>,
  anatomy: "<Switch.Root>\n  <Switch.Thumb />\n</Switch.Root>",
  api: [
    {
      part: "Root",
      description: "The switch itself.",
      props: [
        {
          name: "checked",
          type: "boolean",
          description: "Whether the switch is on.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Whether the switch ignores input.",
        },
      ],
    },
  ],
  keyboard: [{ keys: "Space", action: "Toggles the switch." }],
};

describe("<ComponentPage />", () => {
  test("names the component in the page heading", () => {
    const { getByRole, getByText } = render(() => (
      <ComponentPage {...switchPage} />
    ));
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("Switch");
    expect(
      getByText("A control that turns a setting on or off."),
    ).toBeInTheDocument();
  });

  test("renders the live example in its own section", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const example = getByRole("region", { name: "Example" });
    expect(
      within(example).getByRole("button", { name: "Example switch" }),
    ).toBeInTheDocument();
  });

  test("shows the anatomy as code", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const anatomy = getByRole("region", { name: "Anatomy" });
    expect(anatomy.querySelector("pre code")).toHaveTextContent(
      "<Switch.Root> <Switch.Thumb /> </Switch.Root>",
    );
  });

  test("lists each part's props with type and default", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const api = getByRole("region", { name: "API reference" });
    expect(within(api).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Root",
    );
    const disabled = within(api).getByRole("row", { name: /disabled/ });
    expect(
      within(disabled)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["boolean", "false", "Whether the switch ignores input."]);
    const checked = within(api).getByRole("row", { name: /checked/ });
    expect(
      within(checked)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["boolean", "—", "Whether the switch is on."]);
  });

  test("lists keyboard interactions", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const keyboard = getByRole("region", { name: "Keyboard" });
    const space = within(keyboard).getByRole("row", { name: /Space/ });
    expect(within(space).getByRole("cell")).toHaveTextContent(
      "Toggles the switch.",
    );
  });

  test("shows the measured size", () => {
    const { getByText } = render(() => (
      <ComponentPage {...switchPage} size={1234} />
    ));
    expect(getByText("1.2 kB")).toBeInTheDocument();
  });

  test("says when the size has not been measured yet", () => {
    const { getByText } = render(() => <ComponentPage {...switchPage} />);
    expect(getByText("Not measured yet")).toBeInTheDocument();
  });

  test("links to the Base UI source it was ported from", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    expect(getByRole("link", { name: "Base UI 1.9.0" })).toHaveAttribute(
      "href",
      "https://github.com/mui/base-ui/tree/v1.9.0/packages/react/src/switch",
    );
  });

  test("updates when a prop changes, without tripping a Solid diagnostic", async () => {
    // captureArtifact records Solid's dev-mode diagnostics during the
    // scenario. Each code maps to its repair in
    // node_modules/solid-js/skills/reactivity-diagnostics/SKILL.md.
    // The name comes from a signal so that a misplaced read is reactive
    // and would be reported.
    const { artifact } = await captureArtifact(
      () => {
        const [name, setName] = createSignal("Switch");
        const { getByRole } = render(() => (
          <ComponentPage {...switchPage} name={name()} size={1234} />
        ));
        setName("Toggle");
        flush();
        expect(getByRole("heading", { level: 1 })).toHaveTextContent("Toggle");
      },
      { scenario: "component-page-render" },
    );
    expectNoDiagnostics(artifact);
  });
});
