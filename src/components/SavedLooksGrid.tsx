"use client";

import { useState } from "react";
import Link from "next/link";
import LookCard from "@/components/LookCard";
import type { GeneratedLook } from "@/lib/types";

export default function SavedLooksGrid({
  initialLooks,
}: {
  initialLooks: GeneratedLook[];
}) {
  const [looks, setLooks] = useState(initialLooks);

  if (looks.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/45">
        No saved looks yet. Tap{" "}
        <span className="font-medium text-white/70">♡ Save</span> on any look in
        the{" "}
        <Link href="/studio" className="text-white underline-offset-4 hover:underline">
          studio
        </Link>{" "}
        to keep it here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {looks.map((look) => (
        <LookCard
          key={look.id}
          look={look}
          onRemove={(id) => setLooks((prev) => prev.filter((l) => l.id !== id))}
        />
      ))}
    </div>
  );
}
