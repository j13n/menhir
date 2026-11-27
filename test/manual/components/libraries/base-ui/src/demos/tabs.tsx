import { Tabs } from "@base-ui/react/tabs";

function Parts() {
  return (
    <>
      <Tabs.List className="tab-list">
        <Tabs.Tab value="account" className="tab">
          Account
        </Tabs.Tab>
        <Tabs.Tab value="password" className="tab">
          Password
        </Tabs.Tab>
        <Tabs.Tab value="billing" className="tab" disabled>
          Billing
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account" className="panel">
        Change your name and email address here.
      </Tabs.Panel>
      <Tabs.Panel value="password" className="panel">
        Choose a new password here.
      </Tabs.Panel>
      <Tabs.Panel value="billing" className="panel">
        See your invoices here.
      </Tabs.Panel>
    </>
  );
}

export default function TabsDemo() {
  return (
    <>
      <Tabs.Root defaultValue="account">
        <Parts />
      </Tabs.Root>

      <h2>Vertical</h2>
      <Tabs.Root
        defaultValue="account"
        orientation="vertical"
        className="tabs-vertical"
      >
        <Parts />
      </Tabs.Root>
    </>
  );
}
