import Landing from "@/components/Landing";

export default function Home() {
  // Static landing — no server-side auth check, so it's prerendered and served
  // straight from the edge (fast, especially with functions now in Mumbai).
  // The primary CTA points at /studio, which serves a guest one-look trial, so
  // the page doesn't need to know whether the visitor is logged in.
  return <Landing isAuthed={false} />;
}
