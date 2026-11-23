// A test menu with submenus two levels deep: Copy, "Share ▸" (Email,
// Messages, "More ▸" (Print, Save)), Paste. Items are 30 px tall and the
// Popups 120 px wide, so a pointer's path can be computed.
import type { JSX } from "@solidjs/web";

import { Menu } from "../../src/menu/index.ts";
import type { MenuRootProps } from "../../src/menu/root/MenuRoot.tsx";
import type { MenuSubmenuProps } from "../../src/menu/submenu/MenuSubmenu.tsx";

const itemStyle: JSX.CSSProperties = {
  height: "30px",
  "box-sizing": "border-box",
  padding: "0 8px",
  "line-height": "30px",
};
const popupStyle: JSX.CSSProperties = {
  width: "120px",
  margin: "0",
  padding: "0",
  border: "0",
};

export interface ShareProps extends MenuRootProps {
  /** Props of the "Share" submenu. */
  share?: Omit<MenuSubmenuProps, "children">;
  /** Props of the "More" submenu. */
  more?: Omit<MenuSubmenuProps, "children">;
  /** Disables the "Share" submenu's trigger. */
  shareDisabled?: boolean;
  /** Called by the Print item. */
  onPrint?: () => void;
  dir?: "ltr" | "rtl";
}

export function Share(props: ShareProps) {
  return (
    <div dir={props.dir}>
      <Menu.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        <Menu.Trigger
          style={{
            position: "fixed",
            top: "50px",
            // Room for two submenus toward the inline end.
            [props.dir === "rtl" ? "right" : "left"]: "10px",
          }}
        >
          Edit
        </Menu.Trigger>
        <Menu.Popup style={popupStyle}>
          <Menu.Item style={itemStyle}>Copy</Menu.Item>
          <Menu.Submenu
            delay={props.share?.delay}
            closeDelay={props.share?.closeDelay}
            onOpenChange={props.share?.onOpenChange}
          >
            <Menu.SubmenuTrigger
              style={itemStyle}
              disabled={props.shareDisabled}
            >
              Share
            </Menu.SubmenuTrigger>
            <Menu.Popup style={popupStyle}>
              <Menu.Item style={itemStyle}>Email</Menu.Item>
              <Menu.Item style={itemStyle}>Messages</Menu.Item>
              <Menu.Submenu
                delay={props.more?.delay}
                onOpenChange={props.more?.onOpenChange}
              >
                <Menu.SubmenuTrigger style={itemStyle}>
                  More
                </Menu.SubmenuTrigger>
                <Menu.Popup style={popupStyle}>
                  <Menu.Item
                    style={itemStyle}
                    onClick={() => props.onPrint?.()}
                  >
                    Print
                  </Menu.Item>
                  <Menu.Item style={itemStyle}>Save</Menu.Item>
                </Menu.Popup>
              </Menu.Submenu>
            </Menu.Popup>
          </Menu.Submenu>
          <Menu.Item style={itemStyle}>Paste</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <button type="button">After</button>
    </div>
  );
}
