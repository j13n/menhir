// A test menubar, "Editor": File (New, Open), Edit (Copy, Cut, "Share ▸"
// (Email, Messages), Paste) and View (Zoom in, Zoom out), with a button
// before and after it, or the given menus instead. Items are
// 30 px tall and the Popups 120 px wide, so a pointer's path can be
// computed.
import type { JSX } from "@solidjs/web";

import type { MenuStateProps } from "../../src/menu/root/MenuContext.ts";
import { Menubar } from "../../src/menubar/index.ts";

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
const triggerStyle: JSX.CSSProperties = {
  width: "60px",
  height: "30px",
  margin: "0",
  padding: "0",
  border: "0",
};

export interface EditorProps {
  /** State props of each menu. */
  file?: MenuStateProps;
  edit?: MenuStateProps;
  view?: MenuStateProps;
  /** Called by the Copy item. */
  onCopy?: () => void;
  /** The menus of the bar, instead of File, Edit and View. */
  children?: JSX.Element;
  dir?: "ltr" | "rtl";
}

export function Editor(props: EditorProps) {
  return (
    <div dir={props.dir}>
      <button type="button">Before</button>
      <Menubar.Root
        aria-label="Editor"
        style={{
          display: "flex",
          position: "fixed",
          top: "50px",
          left: "10px",
        }}
      >
        {props.children ?? <Menus {...props} />}
      </Menubar.Root>
      <button type="button" style={{ position: "fixed", top: "300px" }}>
        After
      </button>
    </div>
  );
}

function Menus(props: EditorProps) {
  return (
    <>
      <Menubar.Menu
        open={props.file?.open}
        defaultOpen={props.file?.defaultOpen}
        onOpenChange={props.file?.onOpenChange}
      >
        <Menubar.Trigger style={triggerStyle}>File</Menubar.Trigger>
        <Menubar.Popup style={popupStyle}>
          <Menubar.Item style={itemStyle}>New</Menubar.Item>
          <Menubar.Item style={itemStyle}>Open</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu
        open={props.edit?.open}
        defaultOpen={props.edit?.defaultOpen}
        onOpenChange={props.edit?.onOpenChange}
      >
        <Menubar.Trigger style={triggerStyle}>Edit</Menubar.Trigger>
        <Menubar.Popup style={popupStyle}>
          <Menubar.Item style={itemStyle} onClick={() => props.onCopy?.()}>
            Copy
          </Menubar.Item>
          <Menubar.Item style={itemStyle}>Cut</Menubar.Item>
          <Menubar.Submenu>
            <Menubar.SubmenuTrigger style={itemStyle}>
              Share
            </Menubar.SubmenuTrigger>
            <Menubar.Popup style={popupStyle}>
              <Menubar.Item style={itemStyle}>Email</Menubar.Item>
              <Menubar.Item style={itemStyle}>Messages</Menubar.Item>
            </Menubar.Popup>
          </Menubar.Submenu>
          <Menubar.Item style={itemStyle}>Paste</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
      <Menubar.Menu
        open={props.view?.open}
        defaultOpen={props.view?.defaultOpen}
        onOpenChange={props.view?.onOpenChange}
      >
        <Menubar.Trigger style={triggerStyle}>View</Menubar.Trigger>
        <Menubar.Popup style={popupStyle}>
          <Menubar.Item style={itemStyle}>Zoom in</Menubar.Item>
          <Menubar.Item style={itemStyle}>Zoom out</Menubar.Item>
        </Menubar.Popup>
      </Menubar.Menu>
    </>
  );
}
