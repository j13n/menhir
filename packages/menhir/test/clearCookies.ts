/**
 * Expires every cookie the document can see, for the next test. A browser
 * changes a `__Host-` or `__Secure-` cookie only with `Secure`, so those are
 * expired with it; without it they would outlive the test, and the test file.
 */
export function clearCookies() {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]!.trim();
    if (!name) continue;
    const secure = /^__(Host|Secure)-/.test(name) ? "; Secure" : "";
    document.cookie = `${name}=; Max-Age=0; Path=/${secure}`;
  }
}
