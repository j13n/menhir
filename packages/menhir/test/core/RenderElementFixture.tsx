// Rendered on the server and hydrated in renderElement.hydrate.test.tsx.
import { dynamic } from "@solidjs/web";
import { Button, Part } from "./Part.tsx";

export default function RenderElementFixture() {
  return (
    <div>
      <Part data-testid="default" class="mine" style={{ color: "red" }} />
      <Part data-testid="tag" render={(p) => <a {...p} href="#x" />} />
      <Part data-testid="component" render={Button} />
      <Part
        data-testid="dynamic"
        render={(p) => {
          const Tag = dynamic(() => "a");
          return <Tag {...p} />;
        }}
      />
    </div>
  );
}
