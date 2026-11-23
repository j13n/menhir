import { fireEvent, render } from "@solidjs/testing-library";
import { captureArtifact, expectNoDiagnostics } from "@solidjs/diagnostics";
import { createRouter, memoryHistory } from "@solidjs/router";
import { onFlush } from "solid-js";
import { describe, expect, test } from "vitest";

import SubscribeForm from "./SubscribeForm";

/** Resolves once the event's flush has run, with the Field's own state. */
const afterFlush = () => new Promise<void>((resolve) => onFlush(resolve));

describe("the forms guide's uncontrolled form, with the router's form action", () => {
  test("blocks an invalid submission before the router, then shows the errors of the router's last submission", async () => {
    const Router = createRouter({
      routes: [{ path: "/", component: SubscribeForm }],
      history: memoryHistory(),
    });
    const { artifact } = await captureArtifact(async () => {
      const { findByRole, getByRole, unmount } = render(() => <Router />);
      const email = (await findByRole("textbox", {
        name: "Email",
      })) as HTMLInputElement;
      const form = email.form!;

      fireEvent.click(getByRole("button", { name: "Subscribe" }));
      await afterFlush();
      expect(email).toHaveFocus();
      expect(form).not.toHaveAttribute("aria-busy");

      email.value = "ada@example.com";
      fireEvent.input(email);
      fireEvent.click(getByRole("button", { name: "Subscribe" }));
      await afterFlush();
      expect(form).toHaveAttribute("aria-busy", "true");

      await new Promise((resolve) => setTimeout(resolve, 600));
      await afterFlush();
      expect(form).not.toHaveAttribute("aria-busy");
      expect(email).toHaveAccessibleDescription(
        "This address is subscribed already.",
      );
      unmount();
    });
    expectNoDiagnostics(artifact);
  });
});
