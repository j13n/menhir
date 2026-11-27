import Drawer from "corvu/drawer";

export default function DrawerDemo() {
  return (
    <Drawer>
      <Drawer.Trigger>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay class="backdrop" />
        <Drawer.Content class="drawer">
          <Drawer.Label>Filters</Drawer.Label>
          <Drawer.Description>
            Drag this sheet down to close it.
          </Drawer.Description>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer>
  );
}
