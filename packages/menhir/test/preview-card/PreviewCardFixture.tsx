// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed card for a link inside a paragraph, its Popup a
// <span>, and a card open by default, which the server renders closed
// (README, "Decisions").
import { PreviewCard } from "../../src/preview-card/index.ts";

export default function PreviewCardFixture() {
  return (
    <>
      <button type="button">Before</button>
      <p data-testid="paragraph">
        Built by{" "}
        <PreviewCard.Root delay={0} closeDelay={0}>
          <PreviewCard.Trigger href="#ada">Ada</PreviewCard.Trigger>
          <PreviewCard.Popup
            data-testid="ada"
            render={(props) => <span {...props} />}
          >
            <PreviewCard.Arrow render={(props) => <span {...props} />} />
            <strong>Ada Lovelace</strong>, analyst
          </PreviewCard.Popup>
        </PreviewCard.Root>
        , in 1843.
      </p>
      <PreviewCard.Root defaultOpen>
        <PreviewCard.Trigger href="#charles" style={{ "margin-top": "100px" }}>
          Charles
        </PreviewCard.Trigger>
        <PreviewCard.Popup data-testid="charles">
          <div>Charles Babbage, engineer</div>
        </PreviewCard.Popup>
      </PreviewCard.Root>
    </>
  );
}
