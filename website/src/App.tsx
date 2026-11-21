import { Title } from "@solidjs/meta";
import { Loading, onSettled } from "solid-js";
import NavBar from "./components/NavBar";
import { Router } from "./router";
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
          <NavBar />
          <div class="mx-auto max-w-6xl px-6 py-12">
            <Loading fallback={<p>Loading…</p>}>{props.children}</Loading>
          </div>
        </>
      )}
    </Router>
  );
}
