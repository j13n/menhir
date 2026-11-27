import { Tabs } from "radix-ui";

function Parts() {
  return (
    <>
      <Tabs.List className="tab-list">
        <Tabs.Trigger className="tab" value="account">
          Account
        </Tabs.Trigger>
        <Tabs.Trigger className="tab" value="password">
          Password
        </Tabs.Trigger>
        <Tabs.Trigger className="tab" value="billing" disabled>
          Billing
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="panel" value="account">
        Change your name and email address here.
      </Tabs.Content>
      <Tabs.Content className="panel" value="password">
        Choose a new password here.
      </Tabs.Content>
      <Tabs.Content className="panel" value="billing">
        See your invoices here.
      </Tabs.Content>
    </>
  );
}

export default function TabsDemo() {
  return (
    <>
      <Tabs.Root className="tabs" defaultValue="account">
        <Parts />
      </Tabs.Root>

      <h2>Vertical</h2>
      <Tabs.Root className="tabs" defaultValue="account" orientation="vertical">
        <Parts />
      </Tabs.Root>
    </>
  );
}
