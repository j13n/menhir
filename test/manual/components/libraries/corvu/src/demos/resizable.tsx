import Resizable from "corvu/resizable";

export default function ResizableDemo() {
  return (
    <>
      <Resizable class="resizable">
        <Resizable.Panel
          initialSize={0.3}
          minSize={0.2}
          class="resizable-panel"
        >
          Navigation
        </Resizable.Panel>
        <Resizable.Handle class="resizable-handle" />
        <Resizable.Panel
          initialSize={0.7}
          minSize={0.2}
          class="resizable-panel"
        >
          Content
        </Resizable.Panel>
      </Resizable>

      <h2>Vertical</h2>
      <Resizable orientation="vertical" class="resizable">
        <Resizable.Panel
          initialSize={0.5}
          minSize={0.2}
          class="resizable-panel"
        >
          Editor
        </Resizable.Panel>
        <Resizable.Handle class="resizable-handle" />
        <Resizable.Panel
          initialSize={0.5}
          minSize={0.2}
          class="resizable-panel"
        >
          Terminal
        </Resizable.Panel>
      </Resizable>
    </>
  );
}
