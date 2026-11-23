import { Meta, Script, Title } from "@solidjs/meta";

/**
 * A page's title and description, for the browser tab, search results and
 * link previews, and its structured data for search engines, if any.
 */
export default function PageHead(props: {
  title: string;
  description: string;
  structuredData?: object;
}) {
  return (
    <>
      <Title>{props.title}</Title>
      <Meta name="description" content={props.description} />
      <Meta property="og:title" content={props.title} />
      <Meta property="og:description" content={props.description} />
      {props.structuredData && (
        // The key gives the script an identity, so the browser adopts the
        // prerendered one and the next page's replaces it. `<` is escaped so
        // the JSON cannot close the script element.
        <Script key="structured-data" type="application/ld+json">
          {JSON.stringify(props.structuredData).replaceAll("<", "\\u003c")}
        </Script>
      )}
    </>
  );
}
