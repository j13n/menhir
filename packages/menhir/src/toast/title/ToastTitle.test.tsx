// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createRenderer, describeConformance, screen } from "#test-utils";

import { stubPopover } from "../../../test/popover/stubPopover.ts";
import { createToastManager, Toast } from "../index.ts";

stubPopover();

{
  const toasts = createToastManager();
  toasts.add({ title: "Saved", description: "Stored", duration: Infinity });
  describeConformance(
    "<Toast.Title />",
    (props) => (
      <Toast.Provider manager={toasts}>
        <Toast.Region>
          {(toast) => (
            <Toast.Root toast={toast}>
              <Toast.Title {...props} />
            </Toast.Root>
          )}
        </Toast.Region>
      </Toast.Provider>
    ),
    { tagName: "DIV" },
  );
}

describe("<Toast.Title />", () => {
  const { render } = createRenderer();

  function Notifications(props: {
    toasts: ReturnType<typeof createToastManager>;
    own?: boolean;
  }) {
    return (
      <Toast.Provider manager={props.toasts}>
        <Toast.Region>
          {(toast) => (
            <Toast.Root toast={toast}>
              {props.own ? (
                <Toast.Title data-testid="part">Its own</Toast.Title>
              ) : (
                <Toast.Title data-testid="part" />
              )}
            </Toast.Root>
          )}
        </Toast.Region>
      </Toast.Provider>
    );
  }

  it("renders the toast's title in a div, with the toast's state", async () => {
    const toasts = createToastManager();
    toasts.add({ title: "Saved", description: "Other", duration: Infinity });
    await render(() => <Notifications toasts={toasts} />);
    const part = screen.getByTestId("part");
    expect(part.tagName).toBe("DIV");
    expect(part).toHaveTextContent(/^Saved$/);
    expect(part).toHaveAttribute("data-open", "");
  });

  it("renders its children instead when it has any", async () => {
    const toasts = createToastManager();
    toasts.add({ title: "Saved", duration: Infinity });
    await render(() => <Notifications toasts={toasts} own />);
    expect(screen.getByTestId("part")).toHaveTextContent(/^Its own$/);
  });

  it("follows update()", async () => {
    const toasts = createToastManager();
    const id = toasts.add({ title: "Saving", duration: Infinity });
    await render(() => <Notifications toasts={toasts} />);
    const part = screen.getByTestId("part");
    toasts.update(id, { title: "Saved" });
    flush();
    expect(screen.getByTestId("part")).toBe(part);
    expect(part).toHaveTextContent(/^Saved$/);
  });
});
