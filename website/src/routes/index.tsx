import { Accordion } from "menhir/accordion";
import { AlertDialog } from "menhir/alert-dialog";
import { Checkbox } from "menhir/checkbox";
import { Collapsible } from "menhir/collapsible";
import { Combobox, includesText } from "menhir/combobox";
import { Dialog } from "menhir/dialog";
import { Meter } from "menhir/meter";
import { NavigationMenu } from "menhir/navigation-menu";
import { ContextMenu } from "menhir/context-menu";
import { Menu } from "menhir/menu";
import { Menubar } from "menhir/menubar";
import { Popover } from "menhir/popover";
import { Progress } from "menhir/progress";
import { Select } from "menhir/select";
import { Separator } from "menhir/separator";
import { Switch } from "menhir/switch";
import { Tabs } from "menhir/tabs";
import { Toggle } from "menhir/toggle";
import { ToggleGroup } from "menhir/toggle-group";
import { Tooltip } from "menhir/tooltip";
import { createMemo, createSignal, For } from "solid-js";

import InstallCommand from "../components/InstallCommand";
import MenhirScene from "../components/MenhirScene";
import PageHead from "../components/PageHead";
import { siteDescription, siteUrl, tagline } from "../site";

// The home page's Tabs example: one tab and one panel per day.
const forecast = [
  { name: "Mon", weather: "Sunny, 18°" },
  { name: "Tue", weather: "Cloudy, 15°" },
  { name: "Wed", weather: "Rain, 12°" },
];

// The home page's Navigation Menu example: one Item per section.
const siteSections = [
  {
    name: "Components",
    links: [
      { label: "Switch", href: "/docs/components/switch" },
      { label: "Dialog", href: "/docs/components/dialog" },
    ],
  },
  {
    name: "Docs",
    links: [
      { label: "Getting started", href: "/docs/getting-started" },
      { label: "Styling", href: "/docs/styling" },
    ],
  },
];

const approachItem =
  "rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60";
const approachNumber = "font-mono text-sm text-stone-500";
// The caption sits at the bottom, so captions line up along each row.
const exampleCard =
  "m-0 flex flex-col justify-between gap-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/60";

const cities = ["Lisbon", "London", "Madrid", "Oslo", "Paris", "Rome"];

export default function Home() {
  // The Combobox's list, filtered by what the user typed.
  const [cityQuery, setCityQuery] = createSignal("");
  const shownCities = createMemo(() =>
    cities.filter((city) => includesText(city, cityQuery())),
  );
  return (
    <>
      <PageHead
        title={`Menhir · ${tagline}`}
        description={siteDescription}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Menhir",
          url: `${siteUrl}/`,
        }}
      />
      <main class="max-w-none">
        <div class="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <h1 class="m-0 text-center text-6xl font-bold tracking-tight md:text-right md:text-7xl">
            Menhir
          </h1>
          <MenhirScene />
          <div class="text-center md:text-left">
            <p class="m-0 text-xl text-stone-600 dark:text-stone-400">
              {tagline}
            </p>
            <p class="mt-3 mb-0">
              <a href="/docs/getting-started" class="font-medium">
                Get started →
              </a>
            </p>
          </div>
        </div>

        <div class="mt-14 flex justify-center">
          <InstallCommand command="pnpm add menhir" />
        </div>

        <ol
          aria-label="Approach"
          class="mt-24 grid list-none gap-6 p-0 md:grid-cols-3"
        >
          <li class={approachItem}>
            <span class={approachNumber}>1</span>
            <h3 class="mt-1">Solid 2.0 idioms</h3>
            <p class="m-0">
              Written for Solid 2.0, not translated from React or Solid 1.x.
              Solid decides the API and the internals.
            </p>
          </li>
          <li class={approachItem}>
            <span class={approachNumber}>2</span>
            <h3 class="mt-1">WAI-ARIA</h3>
            <p class="m-0">
              Each component follows its{" "}
              <a href="https://www.w3.org/WAI/ARIA/apg/patterns/">
                WAI-ARIA Authoring Practices
              </a>{" "}
              pattern for roles, states and keyboard behaviour.
            </p>
          </li>
          <li class={approachItem}>
            <span class={approachNumber}>3</span>
            <h3 class="mt-1">Size</h3>
            <p class="m-0">
              A component costs only what it uses. Every component's{" "}
              <a href="/docs/bundle-size">size</a> is published.
            </p>
          </li>
        </ol>

        <section aria-label="Examples" class="mt-24">
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <figure class={exampleCard}>
              <label class="flex items-center justify-between gap-4">
                Airplane mode
                <Switch.Root class="inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-stone-300 p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:bg-stone-800 dark:bg-stone-700 dark:data-checked:bg-stone-300">
                  <Switch.Thumb class="block size-5 rounded-full bg-white shadow transition-transform data-checked:translate-x-5 dark:data-checked:bg-stone-900" />
                </Switch.Root>
              </label>
              <figcaption class="text-sm">
                <a href="/docs/components/switch">Switch</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <label class="flex items-center justify-between gap-4">
                Email updates
                <Checkbox.Root
                  defaultChecked
                  class="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-stone-400 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-checked:border-transparent data-checked:bg-stone-800 dark:border-stone-500 dark:text-stone-900 dark:data-checked:bg-stone-300"
                >
                  <Checkbox.Indicator class="hidden h-3 w-1.5 -translate-y-px rotate-45 border-r-2 border-b-2 border-current data-checked:block" />
                </Checkbox.Root>
              </label>
              <figcaption class="text-sm">
                <a href="/docs/components/checkbox">Checkbox</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <div class="flex items-center justify-between gap-4">
                Microphone
                <Toggle.Root class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900">
                  Mute
                </Toggle.Root>
              </div>
              <figcaption class="text-sm">
                <a href="/docs/components/toggle">Toggle</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <ToggleGroup.Root
                aria-label="Text alignment"
                defaultValue={["left"]}
                class="flex gap-1"
              >
                <For each={["Left", "Center", "Right"]}>
                  {(name) => (
                    <ToggleGroup.Item
                      value={name.toLowerCase()}
                      class="flex-1 cursor-pointer rounded-md border border-stone-300 px-2 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-pressed:border-transparent data-pressed:bg-stone-800 data-pressed:text-white dark:border-stone-700 dark:data-pressed:bg-stone-300 dark:data-pressed:text-stone-900"
                    >
                      {name}
                    </ToggleGroup.Item>
                  )}
                </For>
              </ToggleGroup.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/toggle-group">Toggle Group</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Progress.Root
                value={70}
                aria-labelledby="home-progress-label"
                class="grid grid-cols-[1fr_auto] gap-2"
              >
                <span id="home-progress-label">Uploading</span>
                <Progress.Value class="text-sm text-stone-500" />
                <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <Progress.Indicator class="h-full w-(--progress) bg-stone-800 dark:bg-stone-300" />
                </div>
              </Progress.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/progress">Progress</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Meter.Root
                value={80}
                aria-labelledby="home-meter-label"
                class="grid grid-cols-[1fr_auto] gap-2"
              >
                <span id="home-meter-label">Battery</span>
                <Meter.Value class="text-sm text-stone-500" />
                <div class="col-span-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div class="h-full w-(--meter) bg-stone-800 dark:bg-stone-300" />
                </div>
              </Meter.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/meter">Meter</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Collapsible.Root>
                <Collapsible.Trigger class="flex cursor-pointer items-center gap-2 before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
                  Release notes
                </Collapsible.Trigger>
                <Collapsible.Panel class="mt-2 text-sm text-stone-500">
                  Adds Collapsible, a button that shows and hides content.
                </Collapsible.Panel>
              </Collapsible.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/collapsible">Collapsible</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Accordion.Root>
                <For
                  each={[
                    {
                      question: "Is it styled?",
                      answer: "No: every part takes your classes.",
                    },
                    {
                      question: "Does it work with SSR?",
                      answer: "Yes, and with hydration.",
                    },
                  ]}
                >
                  {(item) => (
                    <Accordion.Item class="border-b border-stone-200 dark:border-stone-800">
                      <Accordion.Header class="m-0 text-base font-normal">
                        <Accordion.Trigger class="flex w-full cursor-pointer items-center gap-2 py-2 text-start before:transition-[rotate] before:content-['▸'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:before:rotate-90">
                          {item.question}
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Panel class="pb-2 text-sm text-stone-500">
                        {item.answer}
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
                </For>
              </Accordion.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/accordion">Accordion</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Tabs.Root>
                <Tabs.List
                  aria-label="Forecast"
                  class="flex border-b border-stone-200 dark:border-stone-800"
                >
                  <For each={forecast}>
                    {(day) => (
                      <Tabs.Tab
                        value={day.name}
                        class="-mb-px cursor-pointer border-b-2 border-transparent px-3 py-1 text-sm text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-selected:border-current data-selected:text-inherit"
                      >
                        {day.name}
                      </Tabs.Tab>
                    )}
                  </For>
                </Tabs.List>
                <For each={forecast}>
                  {(day) => (
                    <Tabs.Panel
                      value={day.name}
                      class="pt-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
                    >
                      {day.weather}
                    </Tabs.Panel>
                  )}
                </For>
              </Tabs.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/tabs">Tabs</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
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
              <figcaption class="text-sm">
                <a href="/docs/components/dialog">Dialog</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
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
              <figcaption class="text-sm">
                <a href="/docs/components/alert-dialog">Alert Dialog</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
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
              <figcaption class="text-sm">
                <a href="/docs/components/popover">Popover</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <div class="flex items-center justify-between gap-4">
                Document
                <Menu.Root>
                  <Menu.Trigger class="shrink-0 cursor-pointer rounded-md border border-stone-300 px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700">
                    Actions
                  </Menu.Trigger>
                  <Menu.Popup
                    sideOffset={4}
                    class="m-0 min-w-36 origin-(--transform-origin) rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-[opacity,scale] duration-100 data-closed:scale-95 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:scale-95 starting:data-open:opacity-0"
                  >
                    <Menu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Rename
                    </Menu.Item>
                    <Menu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Duplicate
                    </Menu.Item>
                    <Menu.Submenu>
                      <Menu.SubmenuTrigger class="flex cursor-default rounded px-2 py-1.5 outline-none select-none after:ml-auto after:content-['›'] data-active:bg-stone-100 dark:data-active:bg-stone-800">
                        Move to
                      </Menu.SubmenuTrigger>
                      <Menu.Popup class="m-0 min-w-32 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg dark:border-stone-800 dark:bg-stone-900">
                        <Menu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                          Drafts
                        </Menu.Item>
                        <Menu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                          Archive
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Submenu>
                  </Menu.Popup>
                </Menu.Root>
              </div>
              <figcaption class="text-sm">
                <a href="/docs/components/menu">Menu</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <ContextMenu.Root>
                <ContextMenu.Trigger
                  tabindex="0"
                  class="grid h-16 place-items-center rounded-lg border border-dashed border-stone-300 text-sm text-stone-500 select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:border-stone-700 dark:data-open:bg-stone-800"
                >
                  Right-click here
                </ContextMenu.Trigger>
                <ContextMenu.Popup
                  aria-label="Photo"
                  class="m-0 min-w-36 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                >
                  <ContextMenu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                    Open
                  </ContextMenu.Item>
                  <ContextMenu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                    Rename
                  </ContextMenu.Item>
                  <ContextMenu.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                    Delete
                  </ContextMenu.Item>
                </ContextMenu.Popup>
              </ContextMenu.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/context-menu">Context Menu</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <Menubar.Root
                aria-label="Editor"
                class="flex gap-0.5 self-start rounded-lg border border-stone-200 p-1 dark:border-stone-800"
              >
                <Menubar.Menu>
                  <Menubar.Trigger class="cursor-default rounded px-2.5 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:hover:bg-stone-800 dark:data-open:bg-stone-800">
                    File
                  </Menubar.Trigger>
                  <Menubar.Popup
                    class="m-0 min-w-32 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                    sideOffset={4}
                  >
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      New
                    </Menubar.Item>
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Open
                    </Menubar.Item>
                  </Menubar.Popup>
                </Menubar.Menu>
                <Menubar.Menu>
                  <Menubar.Trigger class="cursor-default rounded px-2.5 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:hover:bg-stone-800 dark:data-open:bg-stone-800">
                    Edit
                  </Menubar.Trigger>
                  <Menubar.Popup
                    class="m-0 min-w-32 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                    sideOffset={4}
                  >
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Undo
                    </Menubar.Item>
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Redo
                    </Menubar.Item>
                  </Menubar.Popup>
                </Menubar.Menu>
                <Menubar.Menu>
                  <Menubar.Trigger class="cursor-default rounded px-2.5 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:hover:bg-stone-800 dark:data-open:bg-stone-800">
                    View
                  </Menubar.Trigger>
                  <Menubar.Popup
                    class="m-0 min-w-32 rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                    sideOffset={4}
                  >
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Zoom in
                    </Menubar.Item>
                    <Menubar.Item class="cursor-default rounded px-2 py-1.5 outline-none select-none data-active:bg-stone-100 dark:data-active:bg-stone-800">
                      Zoom out
                    </Menubar.Item>
                  </Menubar.Popup>
                </Menubar.Menu>
              </Menubar.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/menubar">Menubar</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <div class="flex items-center justify-between gap-4">
                <label for="home-select">Paper</label>
                <Select.Root name="paper" defaultValue="a4">
                  <Select.Trigger
                    id="home-select"
                    class="flex min-w-28 cursor-pointer items-center justify-between gap-2 rounded-md border border-stone-300 px-3 py-1 text-sm after:content-['▾'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popup
                    class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                    sideOffset={4}
                  >
                    <Select.Item
                      value="a4"
                      class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      <Select.ItemIndicator class="w-3 data-unselected:invisible">
                        ✓
                      </Select.ItemIndicator>
                      A4
                    </Select.Item>
                    <Select.Item
                      value="a5"
                      class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      <Select.ItemIndicator class="w-3 data-unselected:invisible">
                        ✓
                      </Select.ItemIndicator>
                      A5
                    </Select.Item>
                    <Select.Item
                      value="letter"
                      class="flex cursor-default items-center gap-2 rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                    >
                      <Select.ItemIndicator class="w-3 data-unselected:invisible">
                        ✓
                      </Select.ItemIndicator>
                      Letter
                    </Select.Item>
                  </Select.Popup>
                </Select.Root>
              </div>
              <figcaption class="text-sm">
                <a href="/docs/components/select">Select</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <div class="flex items-center justify-between gap-4">
                <label for="home-combobox" id="home-combobox-label">
                  City
                </label>
                <Combobox.Root
                  name="city"
                  onInputValueChange={(text, { reason }) =>
                    setCityQuery(reason === "input-change" ? text : "")
                  }
                >
                  <Combobox.Input
                    id="home-combobox"
                    class="w-28 rounded-md border border-stone-300 bg-transparent px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 dark:border-stone-700"
                  />
                  <Combobox.Popup
                    class="m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 text-sm text-inherit shadow-lg transition-opacity duration-100 data-closed:opacity-0 dark:border-stone-800 dark:bg-stone-900 starting:data-open:opacity-0"
                    sideOffset={4}
                  >
                    <Combobox.List aria-labelledby="home-combobox-label">
                      <For each={shownCities()}>
                        {(city) => (
                          <Combobox.Item
                            value={city.toLowerCase()}
                            class="cursor-default rounded px-2 py-1.5 select-none data-active:bg-stone-100 dark:data-active:bg-stone-800"
                          >
                            {city}
                          </Combobox.Item>
                        )}
                      </For>
                    </Combobox.List>
                    <Combobox.Status class="px-2 py-1.5 opacity-70 empty:hidden">
                      {(count) => count === 0 && "No city found"}
                    </Combobox.Status>
                  </Combobox.Popup>
                </Combobox.Root>
              </div>
              <figcaption class="text-sm">
                <a href="/docs/components/combobox">Combobox</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
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
              <figcaption class="text-sm">
                <a href="/docs/components/tooltip">Tooltip</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <NavigationMenu.Root aria-label="Example" class="text-sm">
                <ul class="m-0 flex list-none gap-1 p-0">
                  <For each={siteSections}>
                    {(section) => (
                      <NavigationMenu.Item class="relative m-0">
                        <NavigationMenu.Trigger class="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 font-medium after:transition-[rotate] after:content-['▾'] hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:bg-stone-100 data-open:after:rotate-180 dark:hover:bg-stone-800 dark:data-open:bg-stone-800">
                          {section.name}
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Panel class="absolute top-[calc(100%+0.5rem)] left-0 z-10 w-48 rounded-lg border border-stone-200 bg-white p-1 shadow-lg transition-[opacity,translate] duration-150 dark:border-stone-800 dark:bg-stone-900 starting:-translate-y-1 starting:opacity-0">
                          <ul class="m-0 grid list-none gap-0.5 p-0">
                            <For each={section.links}>
                              {(link) => (
                                <li class="m-0">
                                  <NavigationMenu.Link
                                    href={link.href}
                                    class="block rounded-md px-2 py-1.5 text-inherit no-underline hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-500 dark:hover:bg-stone-800"
                                  >
                                    {link.label}
                                  </NavigationMenu.Link>
                                </li>
                              )}
                            </For>
                          </ul>
                        </NavigationMenu.Panel>
                      </NavigationMenu.Item>
                    )}
                  </For>
                </ul>
              </NavigationMenu.Root>
              <figcaption class="text-sm">
                <a href="/docs/components/navigation-menu">Navigation Menu</a>
              </figcaption>
            </figure>
            <figure class={exampleCard}>
              <div class="flex items-center gap-3">
                Draft
                <Separator.Root
                  orientation="vertical"
                  class="h-4 w-px bg-stone-300 dark:bg-stone-700"
                />
                Review
                <Separator.Root
                  orientation="vertical"
                  class="h-4 w-px bg-stone-300 dark:bg-stone-700"
                />
                Publish
              </div>
              <figcaption class="text-sm">
                <a href="/docs/components/separator">Separator</a>
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <footer class="mt-24 border-t border-stone-200 pt-6 text-sm text-stone-500 dark:border-stone-800">
        <p class="m-0">
          Menhir draws inspiration from{" "}
          <a href="https://base-ui.com">Base UI</a>,{" "}
          <a href="https://www.radix-ui.com">Radix</a>, and the Solid UI
          libraries <a href="https://kobalte.dev">Kobalte</a> and{" "}
          <a href="https://corvu.dev">corvu</a>. Thanks to their authors.
        </p>
      </footer>
    </>
  );
}
