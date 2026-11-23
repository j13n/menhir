import { NavigationMenu } from "menhir/navigation-menu";
import { For } from "solid-js";

const sections = [
  {
    name: "Components",
    links: [
      {
        label: "Switch",
        href: "/docs/components/switch",
        text: "Turns a setting on or off.",
      },
      {
        label: "Dialog",
        href: "/docs/components/dialog",
        text: "A window over the page.",
      },
      {
        label: "Navigation Menu",
        href: "/docs/components/navigation-menu",
        text: "This page.",
      },
    ],
  },
  {
    name: "Docs",
    links: [
      {
        label: "Getting started",
        href: "/docs/getting-started",
        text: "Install Menhir.",
      },
      { label: "Styling", href: "/docs/styling", text: "Style a component." },
    ],
  },
];

const trigger =
  "flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 font-medium no-underline hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500 data-open:bg-stone-100 dark:hover:bg-stone-800 dark:data-open:bg-stone-800";
// In the page's flow, placed under its Item, and fading in with
// @starting-style (starting:). Tailwind's preflight hides [hidden] with
// display: none !important, which no transition outlasts, so it closes at
// once.
const panel =
  "absolute top-[calc(100%+0.5rem)] left-0 z-10 w-64 rounded-lg border border-stone-200 bg-white p-2 shadow-lg transition-[opacity,translate] duration-150 dark:border-stone-800 dark:bg-stone-900 starting:-translate-y-1 starting:opacity-0";
const link =
  "block rounded-md p-2 text-stone-600 no-underline hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-stone-500 aria-[current=page]:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:aria-[current=page]:bg-stone-800";

export default function NavigationMenuExample() {
  return (
    <NavigationMenu.Root aria-label="Example" class="text-sm">
      <ul class="m-0 flex list-none gap-1 p-0">
        <For each={sections}>
          {(section) => (
            <NavigationMenu.Item class="relative">
              <NavigationMenu.Trigger
                class={`${trigger} after:transition-[rotate] after:content-['▾'] data-open:after:rotate-180`}
              >
                {section.name}
              </NavigationMenu.Trigger>
              <NavigationMenu.Panel class={panel}>
                <ul class="m-0 grid list-none gap-0.5 p-0">
                  <For each={section.links}>
                    {(item) => (
                      <li class="m-0">
                        <NavigationMenu.Link
                          class={link}
                          href={item.href}
                          aria-current={
                            item.href === "/docs/components/navigation-menu"
                              ? "page"
                              : undefined
                          }
                        >
                          <span class="block font-medium text-stone-950 dark:text-white">
                            {item.label}
                          </span>
                          {item.text}
                        </NavigationMenu.Link>
                      </li>
                    )}
                  </For>
                </ul>
              </NavigationMenu.Panel>
            </NavigationMenu.Item>
          )}
        </For>
        <li class="m-0">
          <NavigationMenu.Link
            class={trigger}
            href="https://github.com/j13n/menhir"
          >
            GitHub
          </NavigationMenu.Link>
        </li>
      </ul>
    </NavigationMenu.Root>
  );
}
