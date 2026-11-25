// The test list and the cases left out are in ../README.md.
import { flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { createToastManager } from "./createToastManager.ts";

/** The listed toasts, as `[id, title]` pairs. */
const listed = (toasts: ReturnType<typeof createToastManager>) =>
  toasts.toasts().map((toast) => [toast.id, toast.title]);

describe("createToastManager", () => {
  it("adds a toast under an id of its own making, with its fields", () => {
    const toasts = createToastManager<{ kind: string }>();
    const id = toasts.add({
      title: "Saved",
      description: "Your changes are stored.",
      priority: "high",
      duration: 1000,
      data: { kind: "save" },
    });
    flush();

    expect(id).toEqual(expect.any(String));
    expect(id).not.toBe("");
    expect(toasts.toasts()).toHaveLength(1);
    const [toast] = toasts.toasts();
    expect(toast).toMatchObject({
      id,
      title: "Saved",
      description: "Your changes are stored.",
      priority: "high",
      duration: 1000,
      data: { kind: "save" },
      open: true,
    });
  });

  it("keeps the id it is given", () => {
    const toasts = createToastManager();
    expect(toasts.add({ id: "upload", title: "Uploading" })).toBe("upload");
    flush();
    expect(listed(toasts)).toEqual([["upload", "Uploading"]]);
  });

  it("lists toasts in the order they were added", () => {
    const toasts = createToastManager();
    const first = toasts.add({ title: "First" });
    const second = toasts.add({ title: "Second" });
    flush();
    expect(first).not.toBe(second);
    expect(listed(toasts)).toEqual([
      [first, "First"],
      [second, "Second"],
    ]);
  });

  it("updates the fields given and keeps the others", () => {
    const toasts = createToastManager();
    const id = toasts.add({ title: "Uploading", description: "1 of 3" });
    flush();
    toasts.update(id, { description: "2 of 3" });
    flush();
    expect(toasts.toasts()[0]).toMatchObject({
      title: "Uploading",
      description: "2 of 3",
    });
  });

  it("updates a toast added in the same turn", () => {
    const toasts = createToastManager();
    const id = toasts.add({ title: "Uploading" });
    toasts.update(id, { title: "Uploaded" });
    flush();
    expect(listed(toasts)).toEqual([[id, "Uploaded"]]);
  });

  it("updates a listed toast when its id is added again", () => {
    const toasts = createToastManager();
    toasts.add({ id: "upload", title: "Uploading", description: "1 of 3" });
    toasts.add({ id: "upload", title: "Uploaded" });
    flush();
    expect(toasts.toasts()).toHaveLength(1);
    expect(toasts.toasts()[0]).toMatchObject({
      title: "Uploaded",
      description: "1 of 3",
    });
  });

  it("removes a toast nobody rendered at once, reporting remove", () => {
    const toasts = createToastManager();
    const onOpenChange = vi.fn();
    const id = toasts.add({ title: "Saved", onOpenChange });
    const other = toasts.add({ title: "Sent" });
    toasts.remove(id);
    flush();
    expect(listed(toasts)).toEqual([[other, "Sent"]]);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, {
      reason: "remove",
    });
  });

  it("removes all", () => {
    const toasts = createToastManager();
    const onOpenChange = vi.fn();
    toasts.add({ title: "Saved", onOpenChange });
    toasts.add({ title: "Sent", onOpenChange });
    toasts.remove();
    flush();
    expect(toasts.toasts()).toEqual([]);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("does nothing for an id it does not list", () => {
    const toasts = createToastManager();
    const id = toasts.add({ title: "Saved" });
    toasts.remove("unknown");
    toasts.update("unknown", { title: "Changed" });
    flush();
    expect(listed(toasts)).toEqual([[id, "Saved"]]);
  });
});
