// test/menu/Share.tsx as a Context Menu: Copy, "Share ▸" (Email, Messages,
// "More ▸" (Print, Save)), Paste, opened from a focusable "Edit" area where
// Menu's Trigger sits. Items are 30 px tall and the Popups 120 px wide.
import type { JSX } from "@solidjs/web";

import { ContextMenu } from "../../src/context-menu/index.ts";
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
      <ContextMenu.Root
        open={props.open}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        <ContextMenu.Trigger
          data-testid="area"
          tabindex="0"
          style={{
            position: "fixed",
            top: "50px",
            // Room for two submenus toward the inline end.
            [props.dir === "rtl" ? "right" : "left"]: "10px",
            width: "40px",
            height: "20px",
          }}
        >
          Edit
        </ContextMenu.Trigger>
        <ContextMenu.Popup aria-label="Edit" style={popupStyle}>
          <ContextMenu.Item style={itemStyle}>Copy</ContextMenu.Item>
          <ContextMenu.Submenu
            delay={props.share?.delay}
            closeDelay={props.share?.closeDelay}
            onOpenChange={props.share?.onOpenChange}
          >
            <ContextMenu.SubmenuTrigger
              style={itemStyle}
              disabled={props.shareDisabled}
            >
              Share
            </ContextMenu.SubmenuTrigger>
            <ContextMenu.Popup style={popupStyle}>
              <ContextMenu.Item style={itemStyle}>Email</ContextMenu.Item>
              <ContextMenu.Item style={itemStyle}>Messages</ContextMenu.Item>
              <ContextMenu.Submenu
                delay={props.more?.delay}
                onOpenChange={props.more?.onOpenChange}
              >
                <ContextMenu.SubmenuTrigger style={itemStyle}>
                  More
                </ContextMenu.SubmenuTrigger>
                <ContextMenu.Popup style={popupStyle}>
                  <ContextMenu.Item
                    style={itemStyle}
                    onClick={() => props.onPrint?.()}
                  >
                    Print
                  </ContextMenu.Item>
                  <ContextMenu.Item style={itemStyle}>Save</ContextMenu.Item>
                </ContextMenu.Popup>
              </ContextMenu.Submenu>
            </ContextMenu.Popup>
          </ContextMenu.Submenu>
          <ContextMenu.Item style={itemStyle}>Paste</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Root>
      <button type="button">After</button>
    </div>
  );
}
