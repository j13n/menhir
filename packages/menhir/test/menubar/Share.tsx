// test/menu/Share.tsx as a Menubar: a bar of one "Edit" menu with Copy,
// "Share ▸" (Email, Messages, "More ▸" (Print, Save)), Paste, where Menu's
// Trigger sits, and a button before it. Items are 30 px tall and the Popups
// 120 px wide.
import type { JSX } from "@solidjs/web";

import { Menubar } from "../../src/menubar/index.ts";
import type { ShareProps } from "../menu/Share.tsx";

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

export function Share(props: ShareProps) {
  return (
    <div dir={props.dir}>
      <button type="button">Before</button>
      <Menubar.Root
        aria-label="Editor"
        style={{
          position: "fixed",
          top: "50px",
          // Room for two submenus toward the inline end.
          [props.dir === "rtl" ? "right" : "left"]: "10px",
        }}
      >
        <Menubar.Menu
          open={props.open}
          defaultOpen={props.defaultOpen}
          onOpenChange={props.onOpenChange}
        >
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Popup style={popupStyle}>
            <Menubar.Item style={itemStyle}>Copy</Menubar.Item>
            <Menubar.Submenu
              delay={props.share?.delay}
              closeDelay={props.share?.closeDelay}
              onOpenChange={props.share?.onOpenChange}
            >
              <Menubar.SubmenuTrigger
                style={itemStyle}
                disabled={props.shareDisabled}
              >
                Share
              </Menubar.SubmenuTrigger>
              <Menubar.Popup style={popupStyle}>
                <Menubar.Item style={itemStyle}>Email</Menubar.Item>
                <Menubar.Item style={itemStyle}>Messages</Menubar.Item>
                <Menubar.Submenu
                  delay={props.more?.delay}
                  onOpenChange={props.more?.onOpenChange}
                >
                  <Menubar.SubmenuTrigger style={itemStyle}>
                    More
                  </Menubar.SubmenuTrigger>
                  <Menubar.Popup style={popupStyle}>
                    <Menubar.Item
                      style={itemStyle}
                      onClick={() => props.onPrint?.()}
                    >
                      Print
                    </Menubar.Item>
                    <Menubar.Item style={itemStyle}>Save</Menubar.Item>
                  </Menubar.Popup>
                </Menubar.Submenu>
              </Menubar.Popup>
            </Menubar.Submenu>
            <Menubar.Item style={itemStyle}>Paste</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
      <button type="button">After</button>
    </div>
  );
}
