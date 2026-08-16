// Inline script helper. React warns in development when a component renders a
// raw <script> tag (inline scripts don't execute on the client). Per the Next
// guide (preventing-flash-before-hydration), emit a real script on the server
// and an inert text/plain node on the client; suppressHydrationWarning covers
// the type mismatch. The script still runs during the initial HTML parse.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
