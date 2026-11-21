import { fireEvent, render, within } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { createSignal, flush } from "solid-js";
import { describe, expect, test } from "vitest";

import ComponentPage, { type ComponentPageProps } from "./ComponentPage";

const switchPage: ComponentPageProps = {
  slug: "switch",
  name: "Switch",
  description: "A control that turns a setting on or off.",
  example: {
    css: {
      render: () => (
        <button type="button" class="switch">
          CSS switch
        </button>
      ),
      files: [
        { name: "SwitchExample.tsx", code: '<button class="switch" />' },
        { name: "switch.css", code: ".switch { border-radius: 9999px; }" },
      ],
    },
    tailwind: {
      render: () => (
        <button type="button" class="rounded-full">
          Tailwind switch
        </button>
      ),
      files: [
        { name: "SwitchExample.tsx", code: '<button class="rounded-full" />' },
      ],
    },
  },
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

/** Each code file under the example, as its caption and its code. */
const codeFiles = (figures: HTMLElement[]) =>
  figures.map((figure) => [
    figure.querySelector("figcaption")?.textContent,
    figure.querySelector("pre code")?.textContent,
  ]);

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

  test("offers Tailwind CSS first, then CSS, beside the Example heading", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const example = getByRole("region", { name: "Example" });
    const heading = within(example).getByRole("heading", { name: "Example" });
    const styling = within(example).getByRole("group", { name: "Styling" });
    expect(heading.parentElement).toBe(styling.parentElement);
    expect(
      within(styling)
        .getAllByRole("radio")
        .map((radio) => radio.parentElement?.textContent),
    ).toEqual(["Tailwind CSS", "CSS"]);
  });

  test("renders the Tailwind CSS example by default, with its code", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const example = within(getByRole("region", { name: "Example" }));
    expect(example.getByRole("radio", { name: "Tailwind CSS" })).toBeChecked();
    expect(example.queryByRole("button", { name: "CSS switch" })).toBeNull();
    // Tailwind classes need the site's preflight, so this one is not reset.
    const live = example.getByRole("button", { name: "Tailwind switch" });
    expect(live.closest(".unstyled-example")).toBeNull();
    expect(codeFiles(example.getAllByRole("figure"))).toEqual([
      ["SwitchExample.tsx", '<button class="rounded-full" />'],
    ]);
  });

  test("switches to the CSS example, unstyled, and its code", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const example = within(getByRole("region", { name: "Example" }));
    fireEvent.click(example.getByRole("radio", { name: "CSS" }));
    flush();
    expect(example.getByRole("radio", { name: "CSS" })).toBeChecked();
    expect(
      example.queryByRole("button", { name: "Tailwind switch" }),
    ).toBeNull();
    const live = example.getByRole("button", { name: "CSS switch" });
    expect(live.closest(".unstyled-example")).not.toBeNull();
    expect(codeFiles(example.getAllByRole("figure"))).toEqual([
      ["SwitchExample.tsx", '<button class="switch" />'],
      ["switch.css", ".switch { border-radius: 9999px; }"],
    ]);
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

  test("scrolls its tables inside their own box, so a phone screen does not scroll sideways", () => {
    const { getAllByRole } = render(() => <ComponentPage {...switchPage} />);
    const tables = getAllByRole("table");
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      expect(table.parentElement).toHaveClass("overflow-x-auto");
    }
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

  test("links its Markdown version beside the page heading, outside the router", () => {
    const { getByRole } = render(() => <ComponentPage {...switchPage} />);
    const link = getByRole("link", { name: "View as Markdown" });
    expect(link.parentElement).toBe(
      getByRole("heading", { level: 1 }).parentElement,
    );
    expect(link).toHaveAttribute("href", "/docs/components/switch.md");
    // The router leaves an anchor with a target alone, so the file loads.
    expect(link).toHaveAttribute("target", "_self");
  });

  test("says when the size has not been measured yet", () => {
    const { getByText } = render(() => <ComponentPage {...switchPage} />);
    expect(getByText("Not measured yet")).toBeInTheDocument();
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
