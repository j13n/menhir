import type { JSX } from "@solidjs/web";

import CodeBlock from "../../components/CodeBlock";
import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import Badges from "../../guides/badge/Badges";
import badgesCode from "../../guides/badge/Badges.tsx?highlight";
import MessagesButton from "../../guides/badge/MessagesButton";
import messagesButtonCode from "../../guides/badge/MessagesButton.tsx?highlight";
import UnreadCount from "../../guides/badge/UnreadCount";
import unreadCountCode from "../../guides/badge/UnreadCount.tsx?highlight";
import { tsx } from "../../highlight";

const colourCode = tsx`{/* Colour alone: nothing says what red means. */}
<span class="inline-block size-2 rounded-full bg-destructive" />

{/* The text says it, and the colour repeats it. */}
<span class="… bg-destructive text-white">Failed</span>

{/* A dot keeps its text beside it, where everyone can read it. */}
<span class="inline-flex items-center gap-1.5 text-sm">
  <span class="size-2 rounded-full bg-destructive" />
  Failed
</span>`;

/** A live example, shown in the shadcn look as its worked examples are. */
function Example(props: { children: JSX.Element }) {
  return (
    <div class="my-4 flex justify-center rounded-lg border border-stone-200 p-10 dark:border-stone-800">
      <div data-look="shadcn">{props.children}</div>
    </div>
  );
}

export default function Badge() {
  return (
    <main>
      <PageHead
        title="Badge for SolidJS: a styled span · Menhir"
        description="A badge is a styled span, so Menhir has no Badge component. When a badge needs more: a count that is announced, a count on an icon button, and text."
      />
      <h1>Badge</h1>
      <p>
        A badge is a small label on or beside something else: a status, a
        category, a count. This page is a recipe, not a component's page.
      </p>
      <Section id="span" title="A styled span">
        <p>
          Menhir has no Badge component. A badge has no behaviour, no state and
          no role, so there is nothing for an unstyled library to ship: it is a{" "}
          <code>&lt;span&gt;</code> with classes, and its variants are classes
          too.
        </p>
        <Example>
          <Badges />
        </Example>
        <CodeBlock code={badgesCode} />
        <p>
          The examples on this page are in the shadcn look, in Tailwind CSS.
          Each look of the <a href="/docs/styling">styling skill</a> has a badge
          among its recipes, so a coding agent that styles your components in a
          look gives your badges the same look.
        </p>
        <p>
          Three kinds of badge need more than a <code>&lt;span&gt;</code>.
        </p>
      </Section>
      <Section id="changing-count" title="A count that changes">
        <p>
          A count that changes while the page is open, and that a screen reader
          user should hear about, is a status: give the badge{" "}
          <code>role="status"</code>. A screen reader then reads its new text
          when the user is idle, without moving focus. Two things make that
          work:
        </p>
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>The element is there before the count changes.</strong> A
            status that is added to the page together with its text is not
            announced, so render the badge from the start, at zero too, and not
            inside a <code>&lt;Show&gt;</code>.
          </li>
          <li>
            <strong>Its text says what is counted.</strong> "3" alone means
            nothing when it is read out, so the badge holds the rest as visually
            hidden text.
          </li>
        </ul>
        <Example>
          <UnreadCount />
        </Example>
        <CodeBlock code={unreadCountCode} />
        <p>
          Leave the role off a count that changes only because of what the user
          just did, such as the number of selected rows: they already know.
        </p>
      </Section>
      <Section id="icon-button" title="A count on an icon button">
        <p>
          A count on an icon button, such as unread messages on an inbox button,
          is part of the button's accessible name: the button reads as
          "Messages, 3 unread". Write the whole name as visually hidden text in
          the button, and hide the badge itself with <code>aria-hidden</code>,
          since it would only repeat the number. A badge placed beside the
          button is a number a screen reader meets on its own, after the button
          and without what it counts.
        </p>
        <Example>
          <MessagesButton />
        </Example>
        <CodeBlock code={messagesButtonCode} />
        <p>
          A change to a button's name is not announced. When the count changes
          while the page is open and should be heard, add a visually hidden{" "}
          <code>role="status"</code> element for it as well, as above.
        </p>
      </Section>
      <Section id="colour" title="Colour that means something">
        <p>
          A badge whose colour carries its meaning, such as red for a failed
          build, needs that meaning as visible text as well, or as an icon with
          a name: colour alone does not reach someone who cannot tell the
          colours apart (WCAG 1.4.1, Use of Color). Text that is only visually
          hidden does not help them, since they read the screen.
        </p>
        <CodeBlock code={colourCode} />
      </Section>
      <Section id="chips" title="Chips are not badges">
        <p>
          The chips of a{" "}
          <a href="/docs/components/multi-combobox">Multi Combobox</a>, one per
          selected value, are that component's own parts, with a remove button
          and keyboard support. They may look like badges, and a look may style
          both alike, but they are not built from this recipe.
        </p>
      </Section>
    </main>
  );
}
