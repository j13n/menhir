import { NavigationMenu } from "radix-ui";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu.Root className="nav">
      <NavigationMenu.List className="nav-list">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content className="stack">
            <NavigationMenu.Link href="#">Analytics</NavigationMenu.Link>
            <NavigationMenu.Link href="#">Reports</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
          <NavigationMenu.Content className="stack">
            <NavigationMenu.Link href="#">About</NavigationMenu.Link>
            <NavigationMenu.Link href="#">Careers</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className="popup padded nav-viewport" />
    </NavigationMenu.Root>
  );
}
