import CodeBlock from "../../components/CodeBlock";
import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import { css, shell } from "../../highlight";

const states = css`.switch[data-checked] {
  background: steelblue;
}
.switch:focus-visible {
  outline: 2px solid steelblue;
  outline-offset: 2px;
}
.switch[data-disabled] {
  opacity: 0.5;
}`;

const animation = css`.popup {
  transition:
    opacity 150ms,
    scale 150ms;
}
/* Entry: where the popup starts from when it opens. */
@starting-style {
  .popup[data-open] {
    opacity: 0;
    scale: 0.95;
  }
}
/* Exit: Menhir keeps the popup shown until this transition ends. */
.popup[data-closed] {
  opacity: 0;
  scale: 0.95;
}`;

const copySkill = shell`cp -r node_modules/menhir/skills/menhir-styling .claude/skills/`;

const instructions = `To style Menhir components, follow node_modules/menhir/skills/menhir-styling/SKILL.md.`;

const prompts = `Style the Dialog and the Switch on the settings page in the shadcn look.

Give every Menhir component in this app the Bootstrap look.

Style the Accordion in the look the app already has.`;

const ownLook = `Style our Menhir components to match this screenshot. Write the look's tokens first.`;

export default function Styling() {
  return (
    <main>
      <PageHead
        title="Styling · Menhir for SolidJS"
        description="Style Menhir's SolidJS components through their data attributes, with Tailwind CSS or plain CSS, or have a coding agent apply one look with the styling skill."
      />
      <h1>Styling</h1>
      <p>
        Menhir ships no styles. You can write each component's CSS yourself, or
        have a coding agent style them in one consistent look with the styling
        skill that comes in the package.
      </p>
      <Section id="by-hand" title="Styling a component yourself">
        <p>
          Every part takes <code>class</code> and <code>style</code>, and
          exposes its state as data attributes that are present or absent, such
          as <code>data-checked</code>, <code>data-open</code>,{" "}
          <code>data-selected</code> and <code>data-disabled</code>. Keyboard
          focus is <code>:focus-visible</code>. Each{" "}
          <a href="/docs/components">component's page</a> lists its parts and
          their attributes, with an example in Tailwind CSS and in plain CSS.
        </p>
        <CodeBlock code={states} />
        <p>
          Popups are in the browser's top layer, so they need no portal and no{" "}
          <code>z-index</code>. Animate one opening with{" "}
          <code>@starting-style</code> on <code>[data-open]</code>, and closing
          with the <code>[data-closed]</code> styles:
        </p>
        <CodeBlock code={animation} />
      </Section>
      <Section id="looks" title="Looks">
        <p>
          A look is a complete visual style for Menhir's components. It has
          three parts:
        </p>
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>Tokens</strong>: the look's named colours and radii, and in
            a look in plain CSS its spacing and shadows, for light and dark, in
            one <code>tokens.css</code>.
          </li>
          <li>
            <strong>Recipes</strong>: the classes or declarations for each kind
            of part, such as buttons, the focus ring and popup surfaces.
          </li>
          <li>
            <strong>Worked examples</strong>: components styled from both, for
            the agent to start from.
          </li>
        </ul>
        <p>
          Two looks come with the skill: the shadcn look, in Tailwind CSS v4,
          and the Bootstrap look, in plain CSS with a CSS module for each
          component. Both have worked examples of{" "}
          <a href="/docs/components/switch">Switch</a>,{" "}
          <a href="/docs/components/dialog">Dialog</a>,{" "}
          <a href="/docs/components/tabs">Tabs</a> and{" "}
          <a href="/docs/components/popover">Popover</a>. Each of those pages
          shows its example in both looks, beside Tailwind CSS and CSS.
        </p>
        <p>
          A look's recipes also cover what Menhir has no component for, because
          it is only a styled element: a <a href="/docs/badge">Badge</a> is a{" "}
          <code>&lt;span&gt;</code>.
        </p>
      </Section>
      <Section id="install-the-skill" title="Give your agent the skill">
        <p>
          The skill is in the package, at{" "}
          <code>node_modules/menhir/skills/menhir-styling</code>, so it matches
          the version you have installed. Agents do not look for skills there,
          so point yours at it with a line in the file it reads at the start,
          such as <code>AGENTS.md</code> or <code>CLAUDE.md</code>:
        </p>
        <pre class="whitespace-pre-wrap">
          <code>{instructions}</code>
        </pre>
        <p>
          Or copy it into your agent's skills folder, here Claude Code's. A copy
          does not follow new releases; copy it again when you update{" "}
          <code>menhir</code>.
        </p>
        <CodeBlock code={copySkill} />
        <p>
          The package's other skill, <code>menhir</code>, wires components into
          an app:{" "}
          <a href="/docs/getting-started#install-the-skills">Getting started</a>{" "}
          gives your agent both.
        </p>
      </Section>
      <Section id="use-the-skill" title="Ask for a look">
        <p>Name the look and the components in your request:</p>
        <pre class="whitespace-pre-wrap">
          <code>{prompts}</code>
        </pre>
        <p>The agent then works in this order:</p>
        <ol class="my-3 list-decimal space-y-2 pl-6">
          <li>
            It chooses the look: the one you name, or the one the app already
            has.
          </li>
          <li>
            It sets the look up, once per app: it adds the look's{" "}
            <code>tokens.css</code>, puts <code>data-look</code> on{" "}
            <code>&lt;html&gt;</code>, and makes light and dark follow the CSS{" "}
            <code>color-scheme</code>, which the{" "}
            <a href="/docs/utilities/color-scheme">Color Scheme</a> utility
            sets.
          </li>
          <li>
            It styles each component: from its worked example when the look has
            one, and otherwise from the look's recipes and the nearest worked
            example.
          </li>
          <li>
            It checks the result in the browser: each state, the open and close
            animations, keyboard focus and contrast, in both color schemes.
          </li>
        </ol>
        <p>
          Because every component uses the same tokens and recipes, components
          styled weeks apart still match.
        </p>
      </Section>
      <Section id="your-own-look" title="A look of your own">
        <p>
          For a look that is not shipped, describe it or show it: a screenshot,
          a site, or your existing design system. The agent writes that look's
          tokens first, keeping the token names of the closest shipped look, and
          then styles the components from them.
        </p>
        <pre class="whitespace-pre-wrap">
          <code>{ownLook}</code>
        </pre>
      </Section>
      <Section id="other-technology" title="A look in the other technology">
        <p>
          A look is written in one technology: the shadcn look in Tailwind CSS,
          the Bootstrap look in plain CSS. When your app uses the other one, say
          so, and the agent translates the look into it, token for token. The
          Bootstrap look comes with Tailwind names for its tokens, so that every
          translation uses the same classes.
        </p>
      </Section>
    </main>
  );
}
