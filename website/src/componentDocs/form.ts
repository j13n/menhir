import { tsx } from "../highlight";
import type { ComponentDoc } from "./types";

export const formDoc: ComponentDoc = {
  slug: "form",
  name: "Form",
  category: "Forms",
  description:
    "A form that shows errors in its Fields and blocks a submission while a control is invalid. It renders a native <form>, so a router's form action and a submission made before the page hydrates work as on any form. Errors from a server or a schema go in as errors, keyed by each Field's name, and show at once. A blocked submission focuses the first invalid control and shows every Field's error in place of the browser's bubble. Form holds no values: they stay in the controls, read with FormData, or in your own state.",
  anatomy: tsx`<Form>
  <Field.Root name="email">…</Field.Root>
</Form>`,
  api: [
    {
      part: "Form",
      description:
        "The form: a <form> that takes every attribute of one, such as method, action or aria-busy. Once hydrated it has novalidate, so the Fields show the errors instead of the browser's bubble; before, the browser validates a submission itself.",
      props: [
        {
          name: "errors",
          type: "Partial<Record<string, string>>",
          description:
            "Errors keyed by a Field's name, one message each, such as a server's answer or a schema's issues. A nested or repeated value's key is its path joined with dots: \"address.city\", \"links.0\". Each shows in its Field at once, and hides once its control is edited or the form is reset, until you pass a new object. They never block a submission.",
        },
        {
          name: "onSubmit",
          type: "(event: SubmitEvent) => void",
          description:
            "The form's submit event, called only when no control is invalid. Form does not cancel it: call event.preventDefault() to submit in the page, such as through an action, or leave it for a router's form action or the server.",
        },
        {
          name: "render",
          type: "(props) => JSX.Element",
          description:
            "Renders the form as another element or component that spreads its props onto a <form>. Read once.",
        },
      ],
    },
    {
      part: "issuesToErrors",
      description:
        'A function, in menhir/form/standard-schema, that turns a schema\'s issues into errors: each message under its path joined with dots, the first issue on a path winning, and an issue with no path under "", for you to show above the submit button. It reads the Standard Schema issue (message and path), so it works with any schema library that implements it, and depends on none. A Form without a schema does not bundle it.',
      props: [
        {
          name: "issues",
          type: "ReadonlyArray<{ message: string; path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }>",
          description:
            'The issues of a failed validation, such as result.issues of schema["~standard"].validate(value).',
        },
      ],
    },
  ],
  keyboard: [
    {
      keys: "Enter",
      action:
        "In a text input, submits the form, as the browser does. A blocked submission moves focus to the first invalid control, which names its error.",
    },
  ],
  sections: [
    {
      id: "schema-on-submit",
      title: "Validated by a schema on submit",
      text: "Run the schema in onSubmit, once the browser's own checks have passed, and pass its issues through issuesToErrors. Each error shows in the Field of that name, and hides once the user edits that control. For errors shown as the user types, once a field is touched, put the result of a memo on the Field's own error instead.",
    },
    {
      id: "server-errors",
      title: "Errors from a server",
      text: 'Pass the server\'s answer as errors. Here an action sends the form and sets a pending flag, which reverts once the action settles. With Solid Router, give the form method="post" and action={formAction(fn)}, pass the errors of its last submission as errors, and style form[aria-busy], which the router sets while it submits. A submission made before the page hydrates is posted to the server, and the errors it returns are in the server HTML, in their Fields.',
    },
  ],
};
