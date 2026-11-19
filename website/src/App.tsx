import { Title } from "@solidjs/meta";
import { Loading, onSettled } from "solid-js";
import { paths, Router } from "./router";
import { watchClockTheme } from "./timeOfDay";
import "./App.css";

export default function App() {
  // Keeps the light or dark theme in step with the clock while the page is open.
  onSettled(() => watchClockTheme());

  return (
    <Router>
      {(props) => (
        <>
          <Title>Menhir</Title>
          <header class="border-b border-stone-200 px-6 py-4 dark:border-stone-800">
            <a class="font-semibold no-underline" href={paths()}>
              Menhir
            </a>
          </header>
          <div class="mx-auto max-w-3xl px-6 py-12">
            <Loading fallback={<p>Loading…</p>}>{props.children}</Loading>
          </div>
        </>
      )}
    </Router>
  );
}
