import { Tabs } from "@kobalte/core/tabs";

function Parts() {
  return (
    <>
      <Tabs.List class="tabs-list">
        <Tabs.Trigger class="tab" value="account">
          Account
        </Tabs.Trigger>
        <Tabs.Trigger class="tab" value="password">
          Password
        </Tabs.Trigger>
        <Tabs.Trigger class="tab" value="billing" disabled>
          Billing
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content class="panel" value="account">
        Change your name and email address here.
      </Tabs.Content>
      <Tabs.Content class="panel" value="password">
        Choose a new password here.
      </Tabs.Content>
      <Tabs.Content class="panel" value="billing">
        See your invoices here.
      </Tabs.Content>
    </>
  );
}

export default function TabsDemo() {
  return (
    <>
      <Tabs class="tabs">
        <Parts />
      </Tabs>

      <h2>Vertical</h2>
      <Tabs class="tabs" orientation="vertical">
        <Parts />
      </Tabs>
    </>
  );
}
