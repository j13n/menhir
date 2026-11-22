// The yellow bar, the same on every page: the page's scroll position, what
// the library wrote to <html> and <body>, and the popup's touch styles. Plain
// DOM, so React and Solid pages share it.
export const long = new URLSearchParams(location.search).has("long");

/** `base` is where the library pages are served, when not on this server. */
export function startStatus(name: string, base = "") {
  const pages: [string, string][] = [
    ["Radix", `${base}/radix.html`],
    ["Base UI", `${base}/base-ui.html`],
    ["Kobalte", `${base}/kobalte.html`],
    ["corvu", `${base}/corvu.html`],
    ["Menhir", `http://${location.hostname}:5180/`],
  ];
  const bar = document.createElement("div");
  bar.id = "status";
  document.body.prepend(bar);
  const version = navigator.userAgent
    .match(/OS ([\d_]+)/)?.[1]
    ?.replace(/_/g, ".");
  const style = (element: Element) =>
    element.getAttribute("style")?.trim() || "none";
  const data = (element: Element) =>
    [...element.attributes]
      .filter((a) => a.name.startsWith("data-"))
      .map((a) => a.name)
      .join(" ");
  function show() {
    const popup = document.querySelector<HTMLElement>(
      "dialog[open], [role=dialog]",
    );
    const computed = popup && getComputedStyle(popup);
    const v = visualViewport;
    bar.innerHTML =
      `<b>${name}${long ? " long" : ""}</b> · scrollY ${Math.round(scrollY)}` +
      ` · ${popup ? "OPEN" : "closed"} · iOS ${version ?? "?"}<br>` +
      `html style: ${style(document.documentElement)}<br>` +
      `body style: ${style(document.body)} ${data(document.body)}<br>` +
      `popup touch-action ${computed?.touchAction ?? "-"}` +
      ` · overscroll ${computed?.overscrollBehaviorY ?? "-"}` +
      ` · pan ${Math.round(v?.offsetTop ?? 0)} · zoom ${(v?.scale ?? 1).toFixed(2)}<br>` +
      pages
        .map(([label, href]) =>
          label === name ? `<b>${label}</b>` : `<a href="${href}">${label}</a>`,
        )
        .join(" · ") +
      ` · <a href="?${long ? "" : "long"}">${long ? "short dialog" : "LONG dialog"}</a>`;
  }
  addEventListener("scroll", show, { passive: true });
  visualViewport?.addEventListener("scroll", show);
  visualViewport?.addEventListener("resize", show);
  // Styles and attributes anywhere, and the portals the libraries add to
  // <body>. Not every element added: the bar's own update adds some.
  const observer = new MutationObserver(show);
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["style", "open", "role", "data-scroll-locked"],
  });
  observer.observe(document.body, { childList: true });
  show();
}

export const rowsBefore = Array.from(
  { length: 12 },
  (_, i) => `Page row ${i + 1}`,
);
export const rowsAfter = Array.from(
  { length: 80 },
  (_, i) => `Page row ${i + 13}`,
);
export const lines = Array.from(
  { length: 30 },
  (_, i) => `Scrollable line ${i + 1}`,
);
export const paragraphs = Array.from(
  { length: 40 },
  (_, i) => `Long dialog paragraph ${i + 1}`,
);
