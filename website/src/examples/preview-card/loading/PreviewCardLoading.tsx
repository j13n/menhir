import { PreviewCard } from "menhir/preview-card";
import { createMemo, createSignal, Loading, Show } from "solid-js";

type Page = { title: string; summary: string };

/** Your app's request for what the link leads to. */
function fetchPage(href: string): Promise<Page> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          title: "Switch",
          summary: `A control that turns an option on or off (${href}).`,
        }),
      500,
    ),
  );
}

const span = (props: object) => <span {...props} />;

export default function PreviewCardLoading() {
  const href = "/docs/components/switch";
  // Set once, on the first opening: the closed Popup is in the page, so
  // its content would load with it otherwise.
  const [opened, setOpened] = createSignal(false);
  const page = createMemo(() => (opened() ? fetchPage(href) : undefined));
  return (
    <p>
      Every control starts from a native element, as the{" "}
      <PreviewCard.Root onOpenChange={(open) => open && setOpened(true)}>
        <PreviewCard.Trigger href={href}>Switch</PreviewCard.Trigger>
        <PreviewCard.Popup sideOffset={8} render={span}>
          {/* `on` shows the fallback for the first opening: the empty
              card was already shown, closed. */}
          <Loading on={opened()} fallback={<span>Loading…</span>}>
            <Show when={page()}>
              {(loaded) => (
                <>
                  <strong>{loaded().title}</strong> {loaded().summary}
                </>
              )}
            </Show>
          </Loading>
        </PreviewCard.Popup>
      </PreviewCard.Root>{" "}
      does.
    </p>
  );
}
