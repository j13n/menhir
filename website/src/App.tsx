import { Link, Meta, Title } from "@solidjs/meta";
import { announceRoutes } from "@solidjs/prerender";
import { useLocation } from "@solidjs/router";
import { Loading } from "solid-js";
import NavBar from "./components/NavBar";
import { Router } from "./router";
import { siteDescription, siteUrl } from "./site";
import "./App.css";

export default function App() {
  // Tells the build's crawl every page, including ones nothing links to.
  announceRoutes(Router);
  return (
    <Router>
      {(props) => (
        <>
          {/* Defaults for every page; a page's own Title and description
              replace them. Link previews fall back to the title and
              description, so there is no og:title or og:description. */}
          <Title>Menhir</Title>
          <Meta name="description" content={siteDescription} />
          <Meta property="og:type" content="website" />
          <Meta property="og:site_name" content="Menhir" />
          <Meta property="og:image" content={`${siteUrl}/og.png`} />
          <Meta property="og:image:width" content="1200" />
          <Meta property="og:image:height" content="630" />
          <Meta
            property="og:image:alt"
            content="Menhir: an ASCII drawing of a standing stone beside the name."
          />
          <Meta name="twitter:card" content="summary_large_image" />
          <PageUrl />
          <NavBar />
          <div class="mx-auto max-w-6xl px-6 py-12">
            <Loading fallback={<p>Loading…</p>}>{props.children}</Loading>
          </div>
        </>
      )}
    </Router>
  );
}

/** The page's address on the site, without a query or hash. */
function PageUrl() {
  const location = useLocation();
  const url = () => `${siteUrl}${location.pathname}`;
  return (
    <>
      <Link rel="canonical" href={url()} />
      <Meta property="og:url" content={url()} />
    </>
  );
}
