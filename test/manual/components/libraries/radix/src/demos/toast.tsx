import { Toast } from "radix-ui";
import { useState } from "react";

interface Message {
  id: number;
  error: boolean;
}

// Radix's toast has two types: "foreground" (the default, announced at
// once) and "background" (announced politely). The error toast keeps the
// default; the plain one is "background".
export default function ToastDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const add = (error: boolean) =>
    setMessages((list) => [...list, { id: Date.now(), error }]);
  const remove = (id: number) =>
    setMessages((list) => list.filter((message) => message.id !== id));

  return (
    <Toast.Provider>
      <div className="row">
        <button onClick={() => add(false)}>Show toast</button>
        <button onClick={() => add(true)}>Show error toast</button>
      </div>
      {messages.map((message) => (
        <Toast.Root
          key={message.id}
          className="toast"
          type={message.error ? "foreground" : "background"}
          onOpenChange={(open) => {
            if (!open) remove(message.id);
          }}
        >
          <Toast.Title>{message.error ? "Failed" : "Saved"}</Toast.Title>
          <Toast.Description>
            {message.error ? "Could not save." : "Your changes were saved."}
          </Toast.Description>
          {message.error ? null : <Toast.Close>Close</Toast.Close>}
        </Toast.Root>
      ))}
      <Toast.Viewport className="toasts" />
    </Toast.Provider>
  );
}
