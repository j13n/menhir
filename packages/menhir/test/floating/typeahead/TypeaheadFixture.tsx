// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a test menu whose popup is open, and a closed test select.
import { Menu } from "./Menu.tsx";
import { Select } from "./Select.tsx";

export default function TypeaheadFixture() {
  return (
    <>
      <Menu open items={["Kiwi", "Lemon", "Mango"]} />
      <Select />
    </>
  );
}
