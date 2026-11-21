/**
 * Loads a document that has a Content Security Policy and one inline script
 * in its head, and returns the attributes of its `<html>` once the document
 * has loaded: none if the policy blocked the script. The document is in a
 * frame of the test page, so it shares its `localStorage` and cookies. Only
 * a real browser enforces the policy: mark the tests `it.skipIf(isJSDOM)`.
 */
export function loadUnderPolicy(
  policy: string,
  script: { source: string; nonce?: string },
): Promise<Record<string, string>> {
  const frame = document.createElement("iframe");
  const nonce = script.nonce ? ` nonce="${script.nonce}"` : "";
  frame.srcdoc =
    `<!doctype html><html><head>` +
    `<meta http-equiv="Content-Security-Policy" content="${policy}">` +
    `<script${nonce}>${script.source}</script>` +
    `</head><body></body></html>`;
  return new Promise((resolve) => {
    frame.addEventListener("load", () => {
      const root = frame.contentDocument!.documentElement;
      const attributes = Object.fromEntries(
        Array.from(root.attributes, ({ name, value }) => [name, value]),
      );
      frame.remove();
      resolve(attributes);
    });
    document.body.append(frame);
  });
}

/**
 * The CSP source that allows one inline script by its content, such as
 * `'sha256-…'`: the SHA-256 of the script's source, in base64.
 */
export async function scriptHashSource(source: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );
  return `'sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}'`;
}
