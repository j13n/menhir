// The frame around every library's page, in plain DOM so that React and
// Solid 1 apps share it: links to the same component in the other
// libraries, and the list of this library's components. One component per
// page (`?c=dialog`), so a screen reader meets nothing but the shell and
// that component, and every visit starts from a fresh page.
import "./page.css";

export interface Entry {
  /** The name in the address, shared by all libraries: `?c=<slug>`. */
  slug: string;
  /** What this library calls the component. */
  label: string;
}

export const libraries = [
  { name: "Kobalte", port: 5191 },
  { name: "corvu", port: 5192 },
  { name: "Base UI", port: 5193 },
  { name: "Radix", port: 5194 },
];

function link(text: string, href: string, current: boolean) {
  const a = document.createElement("a");
  a.textContent = text;
  a.href = href;
  if (current) a.setAttribute("aria-current", "page");
  return a;
}

function list(label: string, links: HTMLAnchorElement[]) {
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", label);
  const ul = document.createElement("ul");
  for (const a of links) {
    const li = document.createElement("li");
    li.append(a);
    ul.append(li);
  }
  nav.append(ul);
  return nav;
}

/**
 * Draws the shell above `#root` and returns the entry the address asks for.
 * When this library has no such component, says so in `#root` and returns
 * nothing.
 */
export function startShell<T extends Entry>(
  library: string,
  entries: T[],
): T | undefined {
  const root = document.getElementById("root")!;
  const slug = new URLSearchParams(location.search).get("c");
  const entry = entries.find((e) => e.slug === slug);
  const query = slug ? `?c=${encodeURIComponent(slug)}` : "";

  const header = document.createElement("header");
  header.id = "shell";
  header.append(
    list(
      "Libraries",
      libraries.map((l) =>
        link(
          l.name,
          `${location.protocol}//${location.hostname}:${l.port}/${query}`,
          l.name === library,
        ),
      ),
    ),
    list(
      `${library} components`,
      entries.map((e) => link(e.label, `?c=${e.slug}`, e === entry)),
    ),
  );
  root.before(header);

  const h1 = document.createElement("h1");
  h1.textContent = entry ? `${library}: ${entry.label}` : library;
  root.before(h1);
  document.title = h1.textContent;

  if (!entry) {
    const p = document.createElement("p");
    p.textContent = slug
      ? `${library} has no "${slug}". Pick a component above.`
      : "Pick a component above.";
    root.append(p);
  }
  return entry;
}
