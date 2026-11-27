import { Drawer } from "@base-ui/react/drawer";

export default function DrawerDemo() {
  return (
    <Drawer.Root swipeDirection="right">
      <Drawer.Trigger>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="backdrop" />
        <Drawer.Viewport className="drawer-viewport">
          <Drawer.Popup className="drawer">
            <Drawer.Content>
              <Drawer.Title>Drawer</Drawer.Title>
              <Drawer.Description>
                This is a drawer that slides in from the side. You can swipe to
                dismiss it.
              </Drawer.Description>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
