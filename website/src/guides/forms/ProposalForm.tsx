import {
  For,
  Show,
  action,
  createOptimistic,
  createSignal,
  createStore,
  snapshot,
} from "solid-js";
import { Field } from "menhir/field";
import { Form } from "menhir/form";
import type { FormErrors } from "menhir/form";
import { issuesToErrors } from "menhir/form/standard-schema";
import { Input } from "menhir/input";

import { proposalSchema } from "./proposalSchema";
import type { Proposal } from "./proposalSchema";

const emptyProposal = (): Proposal => ({
  title: "",
  speaker: { name: "", email: "" },
  links: [""],
});

// Stands for your server.
async function sendProposal(proposal: Proposal) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return proposal.title;
}

/** A text Field whose value is in the app's state. */
function TextField(props: {
  name: string;
  label: string;
  type?: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}) {
  return (
    <Field.Root name={props.name} error={props.error}>
      <Field.Label>{props.label}</Field.Label>
      <Field.Control
        type={props.type}
        render={(p) => (
          <Input.Root
            {...p}
            value={props.value}
            onValueChange={props.onValueChange}
          />
        )}
      />
      <Field.Error />
    </Field.Root>
  );
}

export default function ProposalForm() {
  const [proposal, setProposal] = createStore(emptyProposal());
  // Not part of the proposal: it only has to match the email.
  const [emailAgain, setEmailAgain] = createSignal("");
  const [errors, setErrors] = createSignal<FormErrors>({});
  const [sent, setSent] = createSignal<string>();
  // True while the action runs; it reverts once the action settles.
  const [sending, setSending] = createOptimistic(false);

  const send = action(function* (values: Proposal) {
    setSending(true);
    const title: string = yield sendProposal(values);
    setSent(title);
  });

  // A schema may answer at once or later, so its answer is awaited.
  async function validateAndSend() {
    const result = await proposalSchema["~standard"].validate(
      snapshot(proposal),
    );
    if (result.issues) {
      setErrors(issuesToErrors(result.issues));
    } else {
      setErrors({});
      send(result.value);
    }
  }

  return (
    <Form
      errors={errors()}
      onSubmit={(event) => {
        event.preventDefault();
        void validateAndSend();
      }}
      // Each Input asks for its default on a reset, which empties the
      // store's values; the rows go back to one.
      onReset={() => {
        setProposal((s) => {
          s.links.splice(1);
        });
        setErrors({});
        setSent(undefined);
      }}
    >
      <TextField
        name="title"
        label="Title"
        value={proposal.title}
        onValueChange={(value) =>
          setProposal((s) => {
            s.title = value;
          })
        }
      />
      <TextField
        name="speaker.name"
        label="Your name"
        value={proposal.speaker.name}
        onValueChange={(value) =>
          setProposal((s) => {
            s.speaker.name = value;
          })
        }
      />
      <TextField
        name="speaker.email"
        label="Email"
        type="email"
        value={proposal.speaker.email}
        onValueChange={(value) =>
          setProposal((s) => {
            s.speaker.email = value;
          })
        }
      />
      <TextField
        name="emailAgain"
        label="Email again"
        type="email"
        value={emailAgain()}
        onValueChange={setEmailAgain}
        // Depends on another field, checked as the user types, and shown
        // once this field is touched.
        error={
          emailAgain() !== proposal.speaker.email
            ? "The addresses differ."
            : undefined
        }
      />
      <fieldset>
        <legend>Recordings or slides</legend>
        {/* By index: a row keyed by its text would be made again on each edit. */}
        <For each={proposal.links} keyed={false}>
          {(link, i) => (
            <div>
              <TextField
                name={`links.${i}`}
                label={`Link ${i + 1}`}
                type="url"
                value={link()}
                onValueChange={(value) =>
                  setProposal((s) => {
                    s.links[i] = value;
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setProposal((s) => {
                    s.links.splice(i, 1);
                  })
                }
              >
                Remove link {i + 1}
              </button>
            </div>
          )}
        </For>
        <button
          type="button"
          onClick={() =>
            setProposal((s) => {
              s.links.push("");
            })
          }
        >
          Add a link
        </button>
      </fieldset>
      <Show when={errors()[""]}>
        {(message) => <p role="alert">{message()}</p>}
      </Show>
      <button type="submit" disabled={sending()}>
        {sending() ? "Sending…" : "Send proposal"}
      </button>
      <button type="reset">Start again</button>
      <Show when={sent()}>
        {(title) => <p role="status">Received: {title()}</p>}
      </Show>
    </Form>
  );
}
