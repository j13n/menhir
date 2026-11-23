// The test list and the cases left out are in ../README.md.
import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { z } from "zod";

import { issuesToErrors } from "./index.ts";

describe("issuesToErrors", () => {
  it("joins a path's keys with dots", () => {
    expect(
      issuesToErrors([
        { message: "Enter a year", path: ["content", "year"] },
        { message: "Enter a link", path: ["sources", 0] },
        { message: "Enter a title", path: ["title"] },
      ]),
    ).toEqual({
      "content.year": "Enter a year",
      "sources.0": "Enter a link",
      title: "Enter a title",
    });
  });

  it("reads the key of a path segment object", () => {
    expect(
      issuesToErrors([
        { message: "Enter a link", path: [{ key: "sources" }, { key: 1 }] },
      ]),
    ).toEqual({ "sources.1": "Enter a link" });
  });

  it("keeps the first issue on a path", () => {
    expect(
      issuesToErrors([
        { message: "Enter an email", path: ["email"] },
        { message: "Enter a valid email", path: ["email"] },
      ]),
    ).toEqual({ email: "Enter an email" });
  });

  it("puts an issue with no path, or an empty one, under the empty key", () => {
    expect(issuesToErrors([{ message: "Passwords differ" }])).toEqual({
      "": "Passwords differ",
    });
    expect(issuesToErrors([{ message: "Too many", path: [] }])).toEqual({
      "": "Too many",
    });
  });

  it("gives an empty object for no issues", () => {
    expect(issuesToErrors([])).toEqual({});
  });

  it("makes a key named like an Object.prototype member an own key", () => {
    const errors = issuesToErrors([
      { message: "Enter a name", path: ["__proto__"] },
    ]);

    expect(Object.keys(errors)).toEqual(["__proto__"]);
    expect(errors["__proto__"]).toBe("Enter a name");
    expect(issuesToErrors([])["constructor"]).toBeUndefined();
  });

  // Two schema libraries that implement Standard Schema, with paths in its
  // two forms: zod's keys, valibot's segment objects.
  const expected = {
    "content.year": "Enter a year",
    "sources.1": "Enter a link",
  };
  const value = { content: { year: "" }, sources: ["https://a.example", ""] };

  it("maps a zod schema's issues", async () => {
    const schema = z.object({
      content: z.object({ year: z.string().min(1, "Enter a year") }),
      sources: z.array(z.string().min(1, "Enter a link")),
    });
    const result = await schema["~standard"].validate(value);

    expect(result.issues && issuesToErrors(result.issues)).toEqual(expected);
  });

  it("maps a valibot schema's issues", async () => {
    const schema = v.object({
      content: v.object({
        year: v.pipe(v.string(), v.minLength(1, "Enter a year")),
      }),
      sources: v.array(v.pipe(v.string(), v.minLength(1, "Enter a link"))),
    });
    const result = await schema["~standard"].validate(value);

    expect(result.issues && issuesToErrors(result.issues)).toEqual(expected);
  });
});
