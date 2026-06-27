"use client";

import ReactMarkdown from "react-markdown";

/** Renders a markdown string into the editorial prose styling. */
export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown>{children}</ReactMarkdown>;
}
