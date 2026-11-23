// Rendered on the server and hydrated in the test, so both sides get the
// same tree: a closed menu, and one open by default, which the server
// renders open (README, "Decisions").
import { NavigationMenu } from "../../src/navigation-menu/index.ts";

export default function NavigationMenuFixture() {
  return (
    <>
      <NavigationMenu.Root aria-label="Main">
        <ul>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger style={{ width: "100px", height: "30px" }}>
              Products
            </NavigationMenu.Trigger>
            <NavigationMenu.Panel>
              <NavigationMenu.Link href="#switch">Switch</NavigationMenu.Link>
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="docs">
            <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
            <NavigationMenu.Panel>
              <NavigationMenu.Link href="#guides">Guides</NavigationMenu.Link>
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
        </ul>
      </NavigationMenu.Root>
      <NavigationMenu.Root aria-label="Footer" defaultValue="help">
        <ul>
          <NavigationMenu.Item value="help">
            <NavigationMenu.Trigger>Help</NavigationMenu.Trigger>
            <NavigationMenu.Panel>
              <NavigationMenu.Link href="#contact">Contact</NavigationMenu.Link>
            </NavigationMenu.Panel>
          </NavigationMenu.Item>
        </ul>
      </NavigationMenu.Root>
    </>
  );
}
