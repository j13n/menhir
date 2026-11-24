import { ContextMenu } from "menhir/context-menu";
import { Menu } from "menhir/menu";
import { Menubar } from "menhir/menubar";
import { NavigationMenu } from "menhir/navigation-menu";
import { For } from "solid-js";

import { ExampleCard, ExampleGroup } from "./ExampleGroup";

// The Navigation Menu example: one Item per section.
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

export default function MenuExamples() {
  return (
    <ExampleGroup category="Menus & navigation">
      <ExampleCard name="Menu" href="/docs/components/menu">
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
      </ExampleCard>
      <ExampleCard name="Context Menu" href="/docs/components/context-menu">
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
      </ExampleCard>
      <ExampleCard name="Menubar" href="/docs/components/menubar">
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
      </ExampleCard>
      <ExampleCard
        name="Navigation Menu"
        href="/docs/components/navigation-menu"
      >
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
      </ExampleCard>
    </ExampleGroup>
  );
}
