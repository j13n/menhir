import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import NavBar from "./components/NavBar";
import { Router } from "./router";
import "./App.css";

export default function App() {
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
