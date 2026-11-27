import Disclosure from "corvu/disclosure";

export default function DisclosureDemo() {
  return (
    <Disclosure>
      <Disclosure.Trigger>Show details</Disclosure.Trigger>
      <Disclosure.Content class="panel">
        Order 1042 shipped on Monday.
      </Disclosure.Content>
    </Disclosure>
  );
}
