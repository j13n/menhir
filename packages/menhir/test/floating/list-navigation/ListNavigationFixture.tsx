// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a test menu in the roving form, its popup open, and a test
// combobox whose options are always shown.
import { Combobox } from "./Combobox.tsx";
import { Menu } from "./Menu.tsx";

export default function ListNavigationFixture() {
  return (
    <>
      <Menu open />
      <Combobox items={["Kiwi", "Lemon", "Mango"]} ids={{ Lemon: "lemon" }} />
    </>
  );
}
