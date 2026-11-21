// Rendered on the server and hydrated in the test, so both sides get the
// same tree. Nothing is passed, so the first enabled tab, Billing, is
// selected; Account is disabled, and Security has the consumer's id.
import { Tabs } from "../../src/tabs/index.ts";

export default function TabsFixture() {
  return (
    <Tabs.Root>
      <Tabs.List aria-label="Settings">
        <Tabs.Tab value="account" disabled>
          Account
        </Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Tab value="security" id="security">
          Security
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="account">Account panel</Tabs.Panel>
      <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      <Tabs.Panel value="security">Security panel</Tabs.Panel>
    </Tabs.Root>
  );
}
