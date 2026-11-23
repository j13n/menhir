import { Collapsible } from "menhir/collapsible";
import { createSignal, For } from "solid-js";

const sections = [
  {
    name: "Components",
    links: [
      { label: "Switch", href: "/docs/components/switch" },
      { label: "Dialog", href: "/docs/components/dialog" },
    ],
  },
  {
    name: "Docs",
    links: [{ label: "Getting started", href: "/docs/getting-started" }],
  },
];

export default function NavigationWithoutHover() {
  // The open section's name, null when none is: one open at a time.
  const [open, setOpen] = createSignal<string | null>(null);
  const triggers: Record<string, HTMLElement> = {};
  let nav!: HTMLElement;
  return (
    <nav
      ref={nav}
      aria-label="Main"
      onKeyDown={(event) => {
        // Escape closes the open list and puts focus on its button.
        const name = open();
        if (event.key !== "Escape" || name === null) return;
        setOpen(null);
        triggers[name]?.focus();
      }}
      onFocusOut={(event) => {
        // Focus moving out of the navigation closes the open list.
        const to = event.relatedTarget as Node | null;
        if (to && !nav.contains(to)) setOpen(null);
      }}
    >
      <ul>
        <For each={sections}>
          {(section) => (
            <Collapsible.Root
              render={(props) => <li {...props} />}
              open={open() === section.name}
              onOpenChange={(next) => setOpen(next ? section.name : null)}
            >
              <Collapsible.Trigger
                ref={(element) => {
                  triggers[section.name] = element;
                }}
              >
                {section.name}
              </Collapsible.Trigger>
              <Collapsible.Panel render={(props) => <ul {...props} />}>
                <For each={section.links}>
                  {(link) => (
                    <li>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  )}
                </For>
              </Collapsible.Panel>
            </Collapsible.Root>
          )}
        </For>
      </ul>
    </nav>
  );
}
