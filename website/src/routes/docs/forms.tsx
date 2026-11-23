import CodeBlock from "../../components/CodeBlock";
import PageHead from "../../components/PageHead";
import Section from "../../components/Section";
import proposalFormCode from "../../guides/forms/ProposalForm.tsx?highlight";
import proposalSchemaCode from "../../guides/forms/proposalSchema.ts?highlight";
import subscribeFormCode from "../../guides/forms/SubscribeForm.tsx?highlight";

export default function FormsGuide() {
  return (
    <main>
      <PageHead
        title="Forms without a library · Menhir"
        description="Building forms in Solid 2.0 with Menhir's Field and Form and no form-state library: a store with nested and array values, a schema on submit, errors once touched, pending and reset."
      />
      <h1>Forms without a library</h1>
      <p>
        Menhir's <a href="/docs/components/field">Field</a> and{" "}
        <a href="/docs/components/form">Form</a> hold no values. A value stays
        in its control and is read with <code>FormData</code>, or lives in your
        own state, where Solid already has what a form needs: a store for nested
        and array values, memos for checks, actions for submitting. What Menhir
        adds is where an error goes and when it shows. This page builds two
        forms that way.
      </p>

      <Section id="store" title="A form on a store">
        <p>
          A talk proposal with a nested value (the speaker), a list of links
          with rows added and removed, a field that depends on another, a schema
          run on submit, a pending submit button and a reset.
        </p>
        <CodeBlock code={proposalFormCode} />
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>Values</strong> are in a store, written through the draft:{" "}
            <code>s.speaker.name = value</code>, <code>s.links.push("")</code>.
            Each control is an <a href="/docs/components/input">Input</a> with a
            controlled value, in a Field.
          </li>
          <li>
            <strong>Names are paths</strong>, joined with dots:{" "}
            <code>speaker.name</code>, <code>links.0</code>. A schema's issue
            for <code>["links", 0]</code> reaches the Field named{" "}
            <code>links.0</code>. A list of strings is a{" "}
            <code>{"<For keyed={false}>"}</code>, by index, so a row is not made
            again on each edit.
          </li>
          <li>
            <strong>The browser checks first.</strong> Form blocks a submission
            while a control is invalid, such as an email field holding no
            address, and focuses it. Only then does <code>onSubmit</code> run
            the schema.
          </li>
          <li>
            <strong>The schema runs on submit</strong>, and{" "}
            <code>issuesToErrors</code> turns its issues into Form's{" "}
            <code>errors</code>. Each error shows in its Field at once, and
            hides when the user edits that control. An issue with no path, such
            as "add a link", is an error of the whole form, under{" "}
            <code>""</code>, which you show yourself.
          </li>
          <li>
            <strong>Errors as the user types</strong> go on a Field's own{" "}
            <code>error</code>, such as the second email that must match the
            first. Field shows one only once the field is touched: focus has
            left it, or a submission was tried.
          </li>
          <li>
            <strong>Pending</strong> is a <code>createOptimistic(false)</code>{" "}
            flag the action sets, which reverts once the action settles. Form
            holds no pending state.
          </li>
          <li>
            <strong>Reset</strong> is the browser's. Each controlled Input asks
            for its default through <code>onValueChange</code>, Fields forget
            they were touched, Form hides its errors, and <code>onReset</code>{" "}
            takes the list back to one row.
          </li>
        </ul>
        <p>
          The schema can come from any library that implements{" "}
          <a href="https://standardschema.dev/">Standard Schema</a>.{" "}
          <code>issuesToErrors</code> reads only the issues' message and path.
          Here the schema is written by hand:
        </p>
        <CodeBlock code={proposalSchemaCode} />
      </Section>

      <Section id="uncontrolled" title="An uncontrolled form, with the router">
        <p>
          The shape of the Solid 2.0 forms guide: the inputs hold their values,
          the browser builds the <code>FormData</code>, and Solid Router's{" "}
          <code>formAction</code> sends it. Form passes <code>method</code> and{" "}
          <code>action</code> through, and takes the errors of the router's last
          submission.
        </p>
        <CodeBlock code={subscribeFormCode} />
        <ul class="my-3 list-disc space-y-2 pl-6">
          <li>
            A blocked submission is cancelled before the router sees it, so the
            action runs only for a valid form.
          </li>
          <li>
            The router sets <code>aria-busy</code> on the form while it submits:
            style <code>form[aria-busy] button</code>.
          </li>
          <li>
            Before the page hydrates, the form is a plain post. The server HTML
            has no <code>novalidate</code>, so the browser checks the controls
            itself, and the errors the server returns are rendered in their
            Fields.
          </li>
        </ul>
      </Section>

      <Section id="next" title="Next">
        <p>
          See <a href="/docs/components/form">Form</a> and{" "}
          <a href="/docs/components/field">Field</a> for every prop.
        </p>
      </Section>
    </main>
  );
}
