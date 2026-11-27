import { NavigationMenu } from "@base-ui/react/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List className="nav-list">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Products <NavigationMenu.Icon />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-content">
            <ul>
              <li>
                <NavigationMenu.Link href="#">Analytics</NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="#">Reports</NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>
            Company <NavigationMenu.Icon />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="nav-content">
            <ul>
              <li>
                <NavigationMenu.Link href="#">About</NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link href="#">Careers</NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link href="#">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner className="nav-positioner" sideOffset={6}>
          <NavigationMenu.Popup className="nav-popup">
            <NavigationMenu.Viewport className="nav-viewport" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
