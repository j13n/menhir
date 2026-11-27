import { NavigationMenu } from "@kobalte/core/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu class="row nav">
      <NavigationMenu.Menu>
        <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
        <NavigationMenu.Portal>
          <NavigationMenu.Content class="nav-content">
            <NavigationMenu.Item class="item" href="#">
              Analytics
            </NavigationMenu.Item>
            <NavigationMenu.Item class="item" href="#">
              Reports
            </NavigationMenu.Item>
          </NavigationMenu.Content>
        </NavigationMenu.Portal>
      </NavigationMenu.Menu>
      <NavigationMenu.Menu>
        <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
        <NavigationMenu.Portal>
          <NavigationMenu.Content class="nav-content">
            <NavigationMenu.Item class="item" href="#">
              About
            </NavigationMenu.Item>
            <NavigationMenu.Item class="item" href="#">
              Careers
            </NavigationMenu.Item>
          </NavigationMenu.Content>
        </NavigationMenu.Portal>
      </NavigationMenu.Menu>
      <NavigationMenu.Trigger as="a" href="#">
        Docs
      </NavigationMenu.Trigger>
      <NavigationMenu.Viewport class="popup nav-viewport" />
    </NavigationMenu>
  );
}
