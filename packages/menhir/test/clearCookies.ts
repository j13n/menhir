/** Expires every cookie the document can see, for the next test. */
export function clearCookies() {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]!.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  }
}
