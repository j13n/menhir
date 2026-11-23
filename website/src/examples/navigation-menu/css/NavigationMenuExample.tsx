import { NavigationMenu } from "menhir/navigation-menu";
import { For } from "solid-js";

import "./navigation-menu.css";

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

export default function NavigationMenuExample() {
  return (
    <NavigationMenu.Root aria-label="Example" class="nav-menu">
      <ul class="nav-menu-list">
        <For each={sections}>
          {(section) => (
            <NavigationMenu.Item class="nav-menu-item">
              <NavigationMenu.Trigger class="nav-menu-trigger">
                {section.name}
              </NavigationMenu.Trigger>
              <NavigationMenu.Panel class="nav-menu-panel">
                <ul class="nav-menu-links">
                  <For each={section.links}>
                    {(link) => (
                      <li>
                        <NavigationMenu.Link
                          class="nav-menu-link"
                          href={link.href}
                          aria-current={
                            link.href === "/docs/components/navigation-menu"
                              ? "page"
                              : undefined
                          }
                        >
                          <span class="nav-menu-link-label">{link.label}</span>
                          {link.text}
                        </NavigationMenu.Link>
                      </li>
                    )}
                  </For>
                </ul>
              </NavigationMenu.Panel>
            </NavigationMenu.Item>
          )}
        </For>
        <li>
          <NavigationMenu.Link
            class="nav-menu-trigger"
            href="https://github.com/j13n/menhir"
          >
            GitHub
          </NavigationMenu.Link>
        </li>
      </ul>
    </NavigationMenu.Root>
  );
}
