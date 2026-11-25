import { AlertDialog } from "menhir/alert-dialog";
import { Dialog } from "menhir/dialog";
import { Popover } from "menhir/popover";
import { PreviewCard } from "menhir/preview-card";
import { createToastManager, Toast } from "menhir/toast";
import { Tooltip } from "menhir/tooltip";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

// The home page's toasts. Made by the module, so nothing is added on the
// server, where the list would be shared between requests.
const toasts = createToastManager();

// A paragraph holds no <div>: the card's parts are <span>s.
const span = (props: object) => <span {...props} />;

export default function OverlayExamples() {
  return (
    <ExampleGroup category="Overlays">
      <ExampleCard name="Dialog" href="/docs/components/dialog">
        <div class="flex items-center justify-between gap-4">
          Profile
          <Dialog.Root>
            <Dialog.Trigger class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
              Edit
            </Dialog.Trigger>
            <Dialog.Popup class="m-auto w-[min(22rem,calc(100%-2rem))] rounded-xl border border-stone-200 bg-white p-6 text-inherit transition-opacity duration-150 backdrop:bg-black/40 backdrop:backdrop-blur-xs backdrop:transition-opacity backdrop:duration-150 data-closed:opacity-0 data-closed:backdrop:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:open:opacity-0 starting:open:backdrop:opacity-0">
              <Dialog.Title class="m-0 text-base font-semibold">
                Edit profile
              </Dialog.Title>
              <Dialog.Description class="mt-2 mb-4 text-sm text-stone-500">
                Your name is shown on your posts.
              </Dialog.Description>
              <label class="grid gap-1 text-sm">
                Name
                <input
                  name="name"
                  value="Ada Lovelace"
                  class="rounded-md border border-stone-300 px-2 py-1 dark:border-stone-700"
                />
              </label>
              <div class="mt-6 flex justify-end">
                <Dialog.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
                  Done
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </Dialog.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Alert Dialog" href="/docs/components/alert-dialog">
        <div class="flex items-center justify-between gap-4">
          Draft
          <AlertDialog.Root>
            <AlertDialog.Trigger class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
              Delete draft
            </AlertDialog.Trigger>
            <AlertDialog.Popup class="m-auto w-[min(22rem,calc(100%-2rem))] rounded-xl border border-stone-200 bg-white p-6 text-inherit transition-opacity duration-150 backdrop:bg-black/40 backdrop:backdrop-blur-xs backdrop:transition-opacity backdrop:duration-150 data-closed:opacity-0 data-closed:backdrop:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:open:opacity-0 starting:open:backdrop:opacity-0">
              <AlertDialog.Title class="m-0 text-base font-semibold">
                Delete this draft?
              </AlertDialog.Title>
              <AlertDialog.Description class="mt-2 text-sm text-stone-500">
                It cannot be undone.
              </AlertDialog.Description>
              <div class="mt-6 flex justify-end gap-2">
                <AlertDialog.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
                  Cancel
                </AlertDialog.Close>
                <AlertDialog.Close class="cursor-pointer rounded-md bg-red-700 px-3 py-1 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
                  Delete
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Popover" href="/docs/components/popover">
        <div class="flex items-center justify-between gap-4">
          Inbox
          <Popover.Root>
            <Popover.Trigger class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
              Notifications
            </Popover.Trigger>
            <Popover.Popup
              sideOffset={8}
              class="w-56 origin-(--transform-origin) overflow-visible rounded-lg border border-stone-200 bg-white p-4 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0"
            >
              <Popover.Arrow class="absolute size-2.5 rotate-45 border-stone-200 bg-white data-[side=bottom]:-top-1.5 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=left]:-right-1.5 data-[side=left]:border-t data-[side=left]:border-r data-[side=right]:-left-1.5 data-[side=right]:border-b data-[side=right]:border-l data-[side=top]:-bottom-1.5 data-[side=top]:border-r data-[side=top]:border-b dark:border-stone-800 dark:bg-stone-900" />
              <Popover.Title class="m-0 text-sm font-semibold">
                All caught up
              </Popover.Title>
              <Popover.Description class="mt-1 mb-3 text-stone-500">
                No new notifications.
              </Popover.Description>
              <Popover.Close class="cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
                Close
              </Popover.Close>
            </Popover.Popup>
          </Popover.Root>
        </div>
      </ExampleCard>
      <ExampleCard name="Preview Card" href="/docs/components/preview-card">
        <p class="m-0 text-sm">
          New here? Start with{" "}
          <PreviewCard.Root>
            <PreviewCard.Trigger
              class="font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
              href="/docs/getting-started"
            >
              Getting started
            </PreviewCard.Trigger>
            <PreviewCard.Popup
              sideOffset={8}
              render={span}
              class="w-56 origin-(--transform-origin) overflow-visible rounded-lg border border-stone-200 bg-white p-4 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-150 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0"
            >
              <PreviewCard.Arrow
                render={span}
                class="absolute size-2.5 rotate-45 border-stone-200 bg-white data-[side=bottom]:-top-1.5 data-[side=bottom]:border-t data-[side=bottom]:border-l data-[side=left]:-right-1.5 data-[side=left]:border-t data-[side=left]:border-r data-[side=right]:-left-1.5 data-[side=right]:border-b data-[side=right]:border-l data-[side=top]:-bottom-1.5 data-[side=top]:border-r data-[side=top]:border-b dark:border-stone-800 dark:bg-stone-900"
              />
              <strong class="block">Getting started</strong>
              <span class="mt-1 block text-stone-500">
                Install Menhir, then build and style your first component.
              </span>
            </PreviewCard.Popup>
          </PreviewCard.Root>
          .
        </p>
      </ExampleCard>
      <ExampleCard name="Tooltip" href="/docs/components/tooltip">
        <div class="flex items-center justify-between gap-4">
          Format
          <Tooltip.Group>
            <div class="flex gap-1">
              <Tooltip.Root>
                <Tooltip.Trigger
                  class="size-8 cursor-pointer rounded-md border border-stone-300 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
                  aria-label="Bold"
                >
                  <b>B</b>
                </Tooltip.Trigger>
                <Tooltip.Popup
                  sideOffset={8}
                  class="m-0 origin-(--transform-origin) overflow-visible rounded border-0 bg-stone-800 px-2 py-1 text-xs text-white transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-stone-200 dark:text-stone-950 starting:data-open:scale-95 starting:data-open:opacity-0"
                >
                  <Tooltip.Arrow class="absolute size-2 rotate-45 bg-stone-800 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1 dark:bg-stone-200" />
                  Make text bold (Ctrl+B)
                </Tooltip.Popup>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger
                  class="size-8 cursor-pointer rounded-md border border-stone-300 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
                  aria-label="Italic"
                >
                  <i>I</i>
                </Tooltip.Trigger>
                <Tooltip.Popup
                  sideOffset={8}
                  class="m-0 origin-(--transform-origin) overflow-visible rounded border-0 bg-stone-800 px-2 py-1 text-xs text-white transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:bg-stone-200 dark:text-stone-950 starting:data-open:scale-95 starting:data-open:opacity-0"
                >
                  <Tooltip.Arrow class="absolute size-2 rotate-45 bg-stone-800 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1 dark:bg-stone-200" />
                  Make text italic (Ctrl+I)
                </Tooltip.Popup>
              </Tooltip.Root>
            </div>
          </Tooltip.Group>
        </div>
      </ExampleCard>
      <ExampleCard name="Toast" href="/docs/components/toast">
        <div class="flex items-center justify-between gap-4">
          Draft
          <Toast.Provider manager={toasts}>
            <button
              type="button"
              class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
              onClick={() =>
                toasts.add({
                  title: "Draft saved",
                  description: "It leaves by itself, or press F6 to reach it.",
                })
              }
            >
              Save
            </button>
            {/* A popover lays out only once shown: `open:` is :popover-open. */}
            <Toast.Region
              aria-label="Notifications"
              class="fixed inset-auto right-4 bottom-4 m-0 w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 overflow-visible border-0 bg-transparent p-0 text-inherit open:flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-500"
            >
              {(toast) => (
                <Toast.Root
                  toast={toast}
                  ref={Toast.swipe({ direction: "right" })}
                  class="relative translate-x-(--toast-swipe-x,0) rounded-lg border border-stone-200 bg-white py-3 pr-10 pl-4 text-sm shadow-lg transition-opacity duration-150 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                >
                  <Toast.Title class="font-semibold" />
                  <Toast.Description class="mt-0.5 text-stone-500 dark:text-stone-400" />
                  <Toast.Close
                    aria-label="Close"
                    class="absolute top-2 right-2 size-6 cursor-pointer rounded border-0 bg-transparent focus-visible:outline-2 focus-visible:outline-stone-500"
                  >
                    ×
                  </Toast.Close>
                </Toast.Root>
              )}
            </Toast.Region>
          </Toast.Provider>
        </div>
      </ExampleCard>
    </ExampleGroup>
  );
}
