import { FileField } from "@kobalte/core/file-field";

export default function FileFieldDemo() {
  return (
    <FileField class="stack" multiple maxFiles={5}>
      <FileField.Label>Attachments</FileField.Label>
      <FileField.Dropzone class="target">
        Drop files here
        <FileField.Trigger>Choose files</FileField.Trigger>
      </FileField.Dropzone>
      <FileField.HiddenInput />
      <FileField.ItemList class="files">
        {() => (
          <FileField.Item class="row">
            <FileField.ItemName />
            <FileField.ItemSize class="hint" />
            <FileField.ItemDeleteTrigger>Delete</FileField.ItemDeleteTrigger>
          </FileField.Item>
        )}
      </FileField.ItemList>
    </FileField>
  );
}
